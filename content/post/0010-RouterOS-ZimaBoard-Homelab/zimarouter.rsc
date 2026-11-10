# RouterOS on a ZimaBoard 2: router, NAS and apps in one box
# Companion config for https://mirceanton.com/posts/routeros-zimaboard-2-homelab/
# Tested on RouterOS 7.25.1 (x86), installed with the container and rose-storage packages.
#
# Before you paste this:
#   - It assumes a fresh install with no default config. ether1 = WAN, ether2 = LAN.
#   - Sections 7+ WIPE AND FORMAT sata1 and sata2.
#   - Change the SMB password in section 8.
#   - Home Assistant expects a USB serial device at usb2. Check yours under /system/resource/usb.

# --- 1. Interfaces and LAN bridge ---
/interface list add name=WAN
/interface list add name=LAN

/interface bridge add name=br0
/interface bridge port add \
    bridge=br0 \
    interface=ether2

/interface list member add \
    list=LAN \
    interface=br0
/interface list member add \
    list=WAN \
    interface=ether1

# --- 2.1 Firewall: input chain ---
/ip firewall filter add chain=input \
    action=accept \
    connection-state=established,related,untracked

/ip firewall filter add chain=input \
    action=drop \
    connection-state=invalid

/ip firewall filter add chain=input \
    action=accept \
    protocol=icmp

/ip firewall filter add chain=input \
    action=drop \
    in-interface-list=!LAN \
    comment="input: drop everything not from LAN"

# --- 2.2 Firewall: forward chain ---
/ip firewall filter add chain=forward \
    action=fasttrack-connection \
    connection-state=established,related

/ip firewall filter add chain=forward \
    action=accept \
    connection-state=established,related,untracked

/ip firewall filter add chain=forward \
    action=drop \
    connection-state=invalid

/ip firewall filter add chain=forward \
    action=drop \
    connection-state=new \
    connection-nat-state=!dstnat \
    in-interface-list=WAN \
    comment="forward: drop WAN-initiated unless port-forwarded"

# --- 2.3 Firewall: NAT ---
/ip firewall nat add \
    chain=srcnat \
    out-interface-list=WAN \
    action=masquerade \
    comment="NAT: masquerade LAN traffic out the WAN"

# --- 3. IPv6 off ---
/ipv6 settings set disable-ipv6=yes
/ipv6 nd set [find] disabled=yes

# --- 4. WAN: DHCP client ---
/ip dhcp-client add interface=ether1

# --- 5. LAN: address, pool, DHCP server, DNS ---
/ip address add \
    address=192.168.88.1/24 \
    interface=br0

/ip pool add \
    name=lan-pool \
    ranges=192.168.88.100-192.168.88.254

/ip dhcp-server network add \
    address=192.168.88.0/24 \
    gateway=192.168.88.1 \
    dns-server=192.168.88.1

/ip dhcp-server add \
    name=lan-dhcp \
    interface=br0 \
    address-pool=lan-pool \
    disabled=no

/ip dns set allow-remote-requests=yes

# --- 6. Hardening: services and discovery ---
/ip service disable telnet,ftp,www,www-ssl,api,api-ssl
/tool bandwidth-server set enabled=no

/ip neighbor discovery-settings set discover-interface-list=LAN
/tool mac-server set allowed-interface-list=LAN
/tool mac-server mac-winbox set allowed-interface-list=LAN

# --- 7. Storage: RAID ---
/disk add type=raid raid-type=1 raid-device-count=2 slot=raid1

/disk set sata1 raid-master=raid1 raid-role=0
/disk set sata2 raid-master=raid1 raid-role=1

/disk format raid1 file-system=ext4

/file add name=raid1/Media type=directory
/file add name=raid1/Media/Movies type=directory
/file add name=raid1/Media/Music type=directory

/file add name=raid1/Containers type=directory
/file add name=raid1/tmp/ type=directory

# --- 8. Storage: SMB shares ---

/ip smb users add \
    name=testuser \
    password=ChangeMe123 \
    read-only=no

/ip smb shares add \
    name=Media \
    directory=raid1/Media \
    valid-users=testuser

/ip smb set enabled=yes

# --- 9. Containers ---

/container/config/set \
    registry-url=https://registry-1.docker.io \
    tmpdir=raid1/tmp

# --- 9.1 Navidrome ---
/interface/veth add name=veth-navi dhcp=yes

/interface/bridge/port add \
    bridge=br0 \
    interface=veth-navi

/container/mounts add \
    list=nav-data \
    src=raid1/Containers/navidrome-data \
    dst=/data
/container/mounts add \
    list=nav-music \
    src=raid1/Media/Music \
    dst=/music

/container/envs/add \
    list=nav-env \
    key=ND_MUSICFOLDER \
    value=/music

/container/envs/add \
    list=nav-env \
    key=TZ \
    value=Europe/Bucharest

/container/add \
    name=navidrome \
    remote-image=deluan/navidrome:latest \
    interface=veth-navi \
    root-dir=raid1/Containers/navidrome \
    mountlists=nav-data,nav-music \
    envlists=nav-env \
    logging=yes \
    start-on-boot=yes

/container/start navidrome

# --- 9.2 Home Assistant ---
/interface/veth add \
    name=veth-ha \
    dhcp=yes
/interface/bridge/port add \
    bridge=br0 \
    interface=veth-ha

/container/mounts add \
    list=ha-config \
    src=raid1/Containers/homeassistant \
    dst=/config

/container/envs add \
    list=ha-env \
    key=TZ \
    value=Europe/Bucharest

/container/add \
    name=homeassistant \
    remote-image=homeassistant/home-assistant:stable \
    interface=veth-ha \
    root-dir=raid1/Containers/homeassistant \
    mountlists=ha-config \
    envlists=ha-env \
    devices=usb2:/dev/ttyACM0 \
    logging=yes \
    start-on-boot=yes

/container/start homeassistant

# --- 9.3 Jellyfin ---
/interface/veth add name=veth-jelly dhcp=yes
/interface/bridge/port add \
    bridge=br0 \
    interface=veth-jelly

/container/mounts add \
    list=jelly-config \
    src=raid1/Containers/jellyfin \
    dst=/config

/container/mounts add \
    list=jelly-cache \
    src=raid1/Containers/jellyfin-cache \
    dst=/cache

/container/mounts add \
    list=jelly-media \
    src=raid1/Media/Movies \
    dst=/media

/container/add \
    name=jellyfin \
    remote-image=jellyfin/jellyfin:latest \
    interface=veth-jelly \
    root-dir=raid1/Containers/jellyfin-root \
    mountlists=jelly-config,jelly-cache,jelly-media \
    logging=yes \
    start-on-boot=yes

/container/start jellyfin
