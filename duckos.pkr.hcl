locals {
  username  = "duckos"
  password  = "duckos"
  full_name = "duckos"

  ssid            = vault("/secret/data/access", "ssid")
  wifi_passphrase = vault("/secret/data/access", "wifi_passphrase")

  ssh            = vault("/secret/data/access", "ssh")
  ssh_pub        = vault("/secret/data/access", "ssh_pub")
  gpg            = vault("/secret/data/access", "gpg")
  git_email      = vault("/secret/data/access", "git_email")
  git_name       = vault("/secret/data/access", "git_name")
  git_signingkey = vault("/secret/data/access", "git_signingkey")
}

source "arm" "duckos" {
  file_urls         = ["https://downloads.raspberrypi.org/raspios_lite_armhf/images/raspios_lite_armhf-2021-03-25/2021-03-04-raspios-buster-armhf-lite.zip"]
  file_checksum_url = "https://downloads.raspberrypi.org/raspios_lite_armhf/images/raspios_lite_armhf-2021-03-25/2021-03-04-raspios-buster-armhf-lite.zip.sha256"

  file_checksum_type    = "sha256"
  file_target_extension = "zip"

  image_build_method = "resize"
  image_chroot_env   = ["PATH=/usr/local/bin:/usr/local/sbin:/usr/bin:/usr/sbin:/bin:/sbin"]
  image_partitions {
    filesystem   = "vfat"
    mountpoint   = "/boot"
    name         = "boot"
    size         = "256M"
    start_sector = "8192"
    type         = "c"
  }
  image_partitions {
    filesystem   = "ext4"
    mountpoint   = "/"
    name         = "root"
    size         = "0"
    start_sector = "532480"
    type         = "83"
  }
  image_path                   = "duckos.img"
  image_size                   = "8G"
  image_type                   = "dos"
  qemu_binary_destination_path = "/usr/bin/qemu-arm-static"
  qemu_binary_source_path      = "/usr/bin/qemu-arm-static"
}

build {
  sources = ["source.arm.duckos"]

  provisioner "shell" {
    inline = [
      # nodejs sources
      "curl -fsSL https://deb.nodesource.com/setup_current.x | bash -",

      "apt-get update",
      "apt-get upgrade -y",
      "apt-get install -y pigpio python-pigpio python3-pigpio nodejs make gcc g++ vim gnupg2 git",

      "pigpiod -v"
    ]
  }
  provisioner "shell" {
    inline = [
      "adduser ${local.username} --disabled-password --gecos \"${local.full_name}\"",
      "adduser ${local.username} sudo",
      "echo \"${local.username}:${local.password}\" | chpasswd",
    ]
  }
  provisioner "file" {
    source      = "src/"
    destination = "/tmp/src/"
  }
  provisioner "shell" {
    inline = [
      "mv /tmp/src/ /home/${local.username}/duckjs",
      "cd /home/${local.username}/duckjs",
      "npm install",
      "chown ${local.username}:${local.username} /home/${local.username} -R"
    ]
  }
  provisioner "file" {
    source      = "duckos-image-resources/"
    destination = "/tmp/"
  }
  provisioner "shell" {
    inline = [
      "sed -i 's/SSID/${local.ssid}/g' /tmp/wpa_supplicant.conf",
      "sed -i 's/WIFI_PASSPHRASE/${local.wifi_passphrase}/g' /tmp/wpa_supplicant.conf",
      "mv /tmp/wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant.conf",
      "echo duckjs > /etc/hostname",
      "echo \"127.0.0.1   duckjs\" >> /etc/hosts",

      "cp /tmp/rc.local /etc/rc.local",
      "systemctl enable ssh"
    ]
  }
  provisioner "shell" {
    inline = [
      "echo \"${local.ssh}\" | base64 -d > /tmp/id_ed25519",
      "echo \"${local.ssh_pub}\" | base64 -d > /tmp/id_ed25519.pub",

      "mkdir /home/${local.username}/.ssh",
      "mv /tmp/id_ed25519 /home/${local.username}/.ssh/.",
      "mv /tmp/id_ed25519.pub /home/${local.username}/.ssh/.",

      "chmod 700 /home/${local.username}/.ssh",
      "chmod 600 /home/${local.username}/.ssh/id_ed25519",
      "chmod 644 /home/${local.username}/.ssh/id_ed25519.pub",

      "chown ${local.username}:${local.username} /home/${local.username}/ -R",

      "echo \"${local.gpg}\" | base64 -d > /tmp/github-gpg.key",
      "gpg2 --import --batch /tmp/github-gpg.key",

      "git config --global user.name \"${local.git_name}\"",
      "git config --global user.email \"${local.git_email}\"",
      "git config --global gpg.program gpg2",
      "git config --global user.signingkey ${local.git_signingkey}",
      "git config --global commit.gpgsign true"
    ]
  }
}
