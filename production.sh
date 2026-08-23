cat Iuppiter.js modernizr.js Jterniabound.js Sprite.js Fighter.js Character.js SpriteButton.js Animation.js Room.js FontEngine.js Action.js events.js Trigger.js commands.js serialization.js Dialoger.js Chooser.js Audio.js Assets.js Debugger.js Path.js > Sburb.js
terser Sburb.js -o Sburb.min.js --compress --mangle
cp index.html index_dev.html
rm index.html
cp index_production.html index.html
powershell.exe -Command "Compress-Archive -Force -Path Sburb.min.js,index.html,README-ownership-liscensing.txt,resources,levels -DestinationPath Jterniabound.zip"
rm index.html
cp index_dev.html index.html
rm index_dev.html
