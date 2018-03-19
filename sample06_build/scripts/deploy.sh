# 以前のバージョンのクリーンアップ
rm -rf __deployme
mkdir __deployme

# ビルド
sh scripts/build.sh

# JavaScriptのミニファイ
uglify -s bundle.js -o __deployme/bundle.js

# CSSのミニファイ
cssshrink bundle.css > __deployme/bundle.css

# HTMLと画像のコピー
cp index.html __deployme/index.html
cp -r images/ __deployme/images/

# 完了
date; echo;