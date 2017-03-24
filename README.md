# CFS(Cloudant File Storage)

## Overview

NoSQL データベースである Cloudant( http://cloudant.com/ ) をファイルストレージとして利用する Node.js ウェブアプリケーションです。


## Install & Settings

- 以下、IBM Bluemix( http://bluemix.net/ ) 環境でアプリケーションを利用する前提でインストール手順を紹介します。まず IBM Bluemix のアカウントを取得してログインし、Node.js ランタイムインスタンスを１つ、Cloudant データベースインスタンスを１つそれぞれ作成し、これら２つをバインドしておきます。また、この後のアプリケーションデプロイ時に利用する cf コマンドラインツールをダウンロード＆インストールしておきます（ https://github.com/cloudfoundry/cli/releases ）。

- この Github リポジトリを clone するか（ git clone https://github.com/dotnsf/cfs.git ）、ダウンロード＆展開します。

- manifest.yml をテキストエディタで編集します。変更の必要がありそうな箇所は以下の３箇所です：

    - domain : Bluemix でランタイムを作ったリージョンのドメインを指定

    - name : Bluemix で作ったランタイムの名前

    - host : name と同じ値

- 必要に応じて settings.js をテキストエディタで編集します。変更の必要がありそうな箇所は以下の３箇所です：

    - exports.basic_username / exports.basic_password : 利用時の認証ユーザー名およびパスワード

    - exports.cloudant_db : このアプリケーションが利用する Cloudant 上のデータベース名（デフォルトでは cfs）

    - exports.cloudant_username / exports.cloudant_password : Cloudant のユーザー名およびパスワード（上記手順で IBM Bluemix のランタイムとバインドした場合は設定不要）

- cf コマンドを使って、アプリケーションをプッシュ（デプロイ）すればインストール完了です。


## Licensing

This code is licensed under MIT.


## Copyright

2017 K.Kimura @ Juge.Me all rights reserved.

