# Elsewhere

<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
Next.js と React。Google Cloud の devfest-hackathon-hexagon に接続。アプリはローカルで実行し、将来の Firebase App Hosting / Cloud Run に備える。現在は公開しない。

## Users
好きな場所から、別の街や地域にある似た場所を探したい人。スマートフォンとPCの両方で使う。

## Product Purpose
場所を入力・選択し、風景、過ごし方、地形を手がかりに候補を探す。共通点と違いを確認し、気になる場所を保存する。

## Capabilities and Constraints
地図・場所の選択は Google Maps / Places、候補の説明は Maps に基づく Gemini を使用。写真検索は Wikimedia Commons の画像だけを Gemini Embedding 2 に送り、既存12地点のコレクション内で比較する。新しい出発点の写真は、場所名・所在地・被写体を照合する。適切な写真や埋め込みがなければ、場所の特徴で比較する。順位を一致率として表示しない。

Earth Engine では、範囲を限定した衛星埋め込みの比較と標高・傾斜・水域の観測を表示する。地形の種類を確定する分類や、レグールの土壌判定は未実装。

Firestore は Firebase Authentication のユーザーごとの保存と共有用の検索条件に使用する。写真や Google の場所の説明を保存データベースへ複製しない。最初は匿名ユーザーで保存し、Google でログインすると保存を引き継いで端末間で同期する。日本語は natural-japanese を参照し、平易で具体的に書く。

## Evidence on Hand
ユーザーの日本語の構想、ローカルを維持する指定、Google プロジェクトの指定、非商用利用と Earth Engine 登録済みの回答。実際の Google API 接続と Commons の写真ライセンスを確認した記録がある。校正された類似率や、地形分類の精度検証データはない。

## Product Principles
- 似ているところと、意味のある違いを説明する。
- 写真の観察と、雰囲気・静かさなどの解釈を分ける。
- 使えない処理と代わりの比較方法を明示する。
- 利用条件と出典を保ち、写真の選択を利用者に任せない。
- ローカルで使える状態を保ち、公開は別の依頼として扱う。
