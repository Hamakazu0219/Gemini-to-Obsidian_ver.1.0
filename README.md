# Gemini to Obsidian Chrome Extension

Geminiでの会話内容を抽出して、Obsidianの特定のVaultおよびフォルダに新しいノートとして保存するChrome拡張機能です。

## 主な機能

- **ワンクリック保存**: Geminiの会話ページから直接Obsidianに内容を送信。
- **自動フォーマット**: 会話をMarkdown形式に変換し、日付やURL、ユーザーとGeminiの発言を整理して保存。
- **設定の保存**: 使用するObsidian Vault名や保存先フォルダを簡単に設定・記憶。

## インストール方法

1.  Chromeで `chrome://extensions` を開きます。
2.  右上の **デベロッパー モード** をオンにします。
3.  **パッケージ化されていない拡張機能を読み込む** をクリックします。
4.  このプロジェクトのフォルダを選択してください。

## 使い方

1.  ブラウザのツールバーにある拡張機能アイコンをクリックし、本拡張機能をピン留めします。
2.  アイコンをクリックして設定画面（Popup）を開きます。
3.  **Vault Name** に保存先のObsidian Vault名を入力します（必須）。
4.  **Folder Path** に保存先のフォルダパスを入力します（任意、例: `GeminiExports`）。
5.  [Gemini](https://gemini.google.com) で会話を行います。
6.  拡張機能アイコンをクリックし、**Save to Obsidian** ボタンを押します。
7.  Obsidianが起動し、新しいノートが作成されます。

## 技術スタック

- Manifest V3
- JavaScript (Vanilla)
- CSS (Vanilla)
- Obsidian URI Scheme (`obsidian://new`)

## 注意事項

- 本拡張機能は `obsidian://` URIスキームを使用します。Obsidianがインストールされている必要があります。
- GeminiのUIアップデートにより、抽出ロジックの修正が必要になる場合があります。

## ライセンス

MIT
