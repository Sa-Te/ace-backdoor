#!/bin/bash
wget -O /path/to/node_app/data/GeoLite2-City.tar.gz "https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-City&license_key=YOUR_LICENSE_KEY&suffix=tar.gz"
tar -xvzf /path/to/node_app/data/GeoLite2-City.tar.gz -C /path/to/node_app/data/
mv /path/to/node_app/data/GeoLite2-City.mmdb /path/to/node_app/data/GeoLite2-City.mmdb
rm /path/to/node_app/data/GeoLite2-City.tar.gz
echo "GeoLite2 database updated successfully."
