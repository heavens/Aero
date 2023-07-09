#!/bin/bash

rm -rf dist/*
mkdir -p dist
yarn webpack
cp static/index.html dist/index.html
cp static/iosevka-regular.ttf dist/iosevka-regular.ttf
yarn webpack serve
