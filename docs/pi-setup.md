# Setting up a Headless Pi from zero

Steps in order to get the pi in working condition with ssh, wifi, and docker.

### OS

Download the [raspberry pi imager](https://www.raspberrypi.org/downloads/), hook up your sd card to your laptop and go.

I like to pick rasbian lite because I'm not using any desktop featrues.

### SSH

Once flashed, create a file in the root of the `boot` directory named `ssh`. It doesn't need to have any thing in it, just create it there.

This will enable the ssh daemon to run at startup with some defaults:

```bash
# password: raspberry
ssh pi@raspberry.local
```

### Wifi

Create a file named `wpa_supplicant.conf` in the root of the `boot` directory so that when RaspianOS boots the pi, it will automatically connect to a network defined in the conf.

Use this setup in conjunction with the ssh setup for easy headless raspberrypi setup.

```
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=«your_ISO-3166-1_two-letter_country_code»

network={
    ssid="«your_SSID»"
    psk="«your_PSK»"
    key_mgmt=WPA-PSK
}
```

The entire [wpa_supplicant](https://w1.fi/cgit/hostap/plain/wpa_supplicant/wpa_supplicant.conf) specification doc.

### Update to latest

I like following the official [instructions](https://www.raspberrypi.org/documentation/raspbian/updating.md) to upgrade.

```bash
sudo apt update
```

then

```bash
sudo apt full-upgrade
```

### Installing docker

It's now super easy to install docker onto the raspberry pi:

```bash
curl -sSL https://get.docker.com |sh
```

Then give your current user permission to run docker commands, as it says when you finish installing docker:

```bash
sudo usermod -aG docker $USER
```

You can can verify it's running with:

```bash
docker info
```

It'll error if it can't get access to the `dockerd`.

You can verify `dockerd` with:

```bash
systemctl status docker
```

### Nice commands

See a snapshot of the process using the most memory

```bash
ps -o pid,user,%mem,command ax | sort -b -k3 -r
```
