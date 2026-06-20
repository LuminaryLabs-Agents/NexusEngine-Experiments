# Chat Tool: make PICO APK

This repo supports a chat-driven PICO deployment command through GitHub Issues and GitHub Actions.

## Chat phrase

When the user says:

```txt
make a PICO APK
```

create a GitHub issue in this repository with:

```txt
Title:
[PICO_DEPLOY] make PICO apk
```

Optional issue body fields:

```txt
device_ip: 192.168.x.x
adb_serial: 192.168.x.x:5555
adb_port: 5555
launch_after_install: true
```

Leave `device_ip` and `adb_serial` empty for USB discovery on the self-hosted runner.

## What the workflow does

The workflow is:

```txt
.github/workflows/make-pico-apk.yml
```

It:

```txt
builds the Spatial Authoring OpenXR APK
uploads the APK artifact
runs deploy on a self-hosted runner labeled `pico`
resolves the PICO headset through adb
installs the APK
launches the app
captures recent launch logs
comments back on the trigger issue
```

## Required local runner setup

A normal GitHub-hosted runner cannot see local headset hardware.

The deploy job requires a self-hosted GitHub runner on a machine that can reach the headset.

Required runner labels:

```txt
self-hosted
pico
```

Required local tools:

```txt
adb / Android Platform Tools
USB access to the headset, or TCP ADB access to the same Wi-Fi network
```

Required headset setup:

```txt
Developer Mode enabled
USB debugging enabled
RSA debugging prompt accepted
headset connected over USB for first discovery, or already reachable over TCP
```

## Safety guard

The issue trigger only runs when all are true:

```txt
title is exactly [PICO_DEPLOY] make PICO apk
author association is OWNER, MEMBER, or COLLABORATOR
```

Otherwise the workflow comments that the request was ignored.

A `pico-deploy` label can still be used for organization, but it is not required for the chat trigger.
