#!/bin/bash
echo UPDATING SYSTEM SOFTWARE
sudo apt-get update
echo UPGRADING SYSTEM SOFTWARE
sudo apt-get upgrade
echo UPDATING SOFTWARE DISTRIBUTION
sudo apt-get dist-upgrade
echo INSTALL PI-BLASTER
git clone https://github.com/mwilliams03/pi-blaster.git 
cd pi-blaster
make pi-blaster
sudo make install
sudo killall pi-blaster
sudo cp /home/pi/tardisClock/pi-blaster-service /etc/init.d/pi-blaster
echo INSTALL I2C
sudo apt-get install i2c-tools
echo UPDATE Node.js
sudo apt-get remove nodered
sudo apt-get remove nodejs nodejs-legacy
wget http://node-arm.herokuapp.com/node_archive_armhf.deb
sudo dpkg -i node_archive_armhf.deb
sudo apt-get install build-essential python-dev python-rpi.gpio
echo INSTALL NPM
sudo apt-get install npm
echo INSTALL TARDISCLOCK Module dependancies 
cd /home/pi/tardisClock
npm install 
echo Build and Start TardisClock service
cp /home/pi/tardisClock/TARDISCLOCK.server /etc/systemd/system/TARDISCLOCK.service
sudo systemctl daemon-reload && sudo systemctl enable TARDISCLOCK.service
sudo systemctl start TARDISCLOCK
