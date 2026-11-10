---
name: Elsewhere
description: '公園の案内のように、写真と地図を見ながら次の行き先を探せる画面。'
colors:
  green: '#2d6048'
  green-dark: '#224c39'
  mint: '#e8efe6'
  paper: '#f7f9f6'
  white: '#fff'
  ink: '#233d32'
  muted: '#64746a'
  line: '#dfe5dc'
  water: '#d6e5e5'
  supporting-copy: '#586b54'
  map-key-ink: '#566f54'
  quality-fill: '#e6eee0'
  quality-ink: '#385733'
  chip-fill: '#f0f4eb'
  chip-ink: '#637b55'
  secondary-fill: '#edf2e6'
  secondary-ink: '#4b6a3d'
  dialog-surface: '#fbfcf8'
  focus: '#789e77'
typography:
  display:
    fontFamily: Manrope, "Noto Sans JP", sans-serif
    fontSize: 48px
    fontWeight: 600
    lineHeight: '1.35'
    letterSpacing: -0.03em
  display-mobile:
    fontFamily: Manrope, "Noto Sans JP", sans-serif
    fontSize: 30px
    fontWeight: 600
    lineHeight: '1.5'
    letterSpacing: -0.04em
  headline:
    fontFamily: Manrope, "Noto Sans JP", sans-serif
    fontSize: 30px
    fontWeight: 550
    lineHeight: '1.6'
    letterSpacing: -0.03em
  title:
    fontFamily: Manrope, "Noto Sans JP", sans-serif
    fontSize: 20px
    fontWeight: 600
    lineHeight: 28px
    letterSpacing: -0.03em
  section:
    fontFamily: Manrope, "Noto Sans JP", sans-serif
    fontSize: 16px
    fontWeight: 650
    lineHeight: 24px
    letterSpacing: -0.02em
  body:
    fontFamily: Manrope, "Noto Sans JP", sans-serif
    fontSize: 16px
    fontWeight: 400
    lineHeight: '1.75'
  body-large:
    fontFamily: Manrope, "Noto Sans JP", sans-serif
    fontSize: 18px
    fontWeight: 600
    lineHeight: 28px
  body-large-mobile:
    fontFamily: Manrope, "Noto Sans JP", sans-serif
    fontSize: 16px
    fontWeight: 600
    lineHeight: 24px
  label:
    fontFamily: Manrope, "Noto Sans JP", sans-serif
    fontSize: 14px
    fontWeight: 500
    lineHeight: 20px
  note:
    fontFamily: Manrope, "Noto Sans JP", sans-serif
    fontSize: 14px
    fontWeight: 400
    lineHeight: 24px
rounded:
  small: 4px
  control: 8px
  surface: 12px
  dialog: 16px
  circle: 50%
spacing:
  '4': 4px
  '8': 8px
  '12': 12px
  '16': 16px
  '24': 24px
  '32': 32px
  '40': 40px
  '48': 48px
components:
  button-primary:
    backgroundColor: '{colors.green}'
    textColor: '{colors.white}'
    rounded: '{rounded.control}'
    padding: 12px 24px
    height: 48px
  button-primary-hover:
    backgroundColor: '{colors.green-dark}'
    textColor: '{colors.white}'
  button-secondary:
    backgroundColor: '{colors.secondary-fill}'
    textColor: '{colors.secondary-ink}'
    rounded: '{rounded.control}'
    padding: 12px 16px
    height: 48px
  button-text:
    textColor: '{colors.green}'
    padding: 4px 0
  button-icon:
    backgroundColor: '{colors.white}'
    textColor: '#61795e'
    rounded: '{rounded.control}'
    height: 40px
    width: 40px
  button-icon-mobile:
    backgroundColor: '{colors.white}'
    textColor: '#61795e'
    rounded: '{rounded.control}'
    height: 44px
    width: 44px
  field:
    textColor: '#263d2f'
    padding: '0'
    typography: '{typography.body-large}'
  field-mobile:
    textColor: '#263d2f'
    padding: '0'
    typography: '{typography.body-large-mobile}'
  nav-item:
    textColor: '#6a776e'
    rounded: '{rounded.control}'
    padding: 8px 16px
    height: 44px
  nav-item-selected:
    backgroundColor: '{colors.mint}'
    textColor: '{colors.green-dark}'
  quality:
    backgroundColor: '#f9fbf7'
    textColor: '#61735e'
    rounded: '{rounded.control}'
    padding: 12px 16px
    height: 46px
  quality-selected:
    backgroundColor: '{colors.quality-fill}'
    textColor: '{colors.quality-ink}'
  quality-chip:
    backgroundColor: '{colors.chip-fill}'
    textColor: '{colors.chip-ink}'
    rounded: '{rounded.small}'
    padding: 4px 8px
  result-card:
    backgroundColor: '{colors.white}'
    textColor: '{colors.ink}'
    rounded: '{rounded.surface}'
  dialog:
    backgroundColor: '{colors.dialog-surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.dialog}'
    width: min(560px, calc(100% - 32px))
---

# Elsewhere のデザイン

## 基本方針

既存の「Modern Park Field Guide」を引き継ぎます。公園の案内のように、緑の文字と明るい背景を使い、場所の写真と地図を中心に配置します。機能の追加に合わせて日本語の組版と操作を整え、ブランドの置き換えは行いません。

写真から分かることと、過ごし方についての解釈を分けます。比較できる範囲、代わりに使った検索方法、未対応の機能を、その場で確認できるようにします。順位を実測の一致率に見せないことも、画面のルールです。

## 色と文字

色・角丸・基本の間隔は、冒頭のトークンを基準にします。主な操作は濃い緑、選択状態は薄い緑の背景で示します。状態は色だけに頼らず、チェック、文言、押下状態も合わせて伝えます。補足文には supporting-copy、地図の凡例には map-key-ink を使います。

欧文のブランドは Manrope、日本語は Noto Sans JP を使います。見出しと入力項目の書体をそろえ、写真や地名が読み取りやすい組版にします。

主見出しはPCで48px、太さ600、行高1.35、字間−0.03emです。幅1250px以下では34px、1000px以下では32pxにします。幅760px以下は30px、行高1.5、字間−0.04emです。本文の基本は16px、行高1.75。補足とラベルは14pxを基準にし、アプリが表示する出典などの小さな文字は12px以上にします。地図の中の提供元表記は、配信元の表示を保ちます。導入文の行高は1.8、案内ダイアログの見出しは1.6、場所の詳細の見出しは1.5です。入力欄はPCで18px、スマートフォンで16pxにします。

## 配置と画面幅

PCでは、見出しと検索フォームの下に、出発点と特徴を選ぶ左カラム、地図と候補を見る右カラムを置きます。基本の外側余白は48px、左カラムは280pxです。幅1250px以下では外側余白32px、左カラム260px。幅1000px以下では左カラム240px、候補を2列にします。

幅760px以下は1列にし、外側余白16px、上側余白24px、主な領域間の間隔20pxにします。出発点は幅88pxの写真と説明を横に並べた小さな表示に変えます。選んだ特徴を短く表示し、「変更」で選択肢を開きます。写真と特徴の比重の調整欄も、detailsを開いたときだけ表示します。候補は1列に並べます。

地形の画面では、特徴を選ぶ左カラムを隠し、地域・気候区分・国の条件を上に残して、解析条件・地図・観測値を全幅で表示します。範囲選択の地図はPCで400px、スマートフォンで340px。3D地球儀はPCで440px、スマートフォンで360px。観測値の表は狭い画面で横にスクロールできます。

## 操作と状態

主要ボタンは高さ48pxを基準にします。スマートフォンの地図操作、保存ボタン、ダイアログの閉じるボタンは44px。フォーカスの枠線と、選択・読み込み中・無効の状態を残します。特徴は一つ以上選択された状態を保ちます。

場所と地域の入力候補は、ラベル付きのコンボボックスとして表示します。地域の矢印は44pxのボタンで、開閉状態も伝えます。キーボードで選択・決定・閉じる操作ができます。検索中は進行中の文言と中止ボタンを表示し、候補がないときは次にできる操作を案内します。APIを使えないときに、実行していない画像比較や地形解析を成功したように見せません。

地図のピンと一覧は同じ場所を指し、選んだ候補を双方で確認できる構成を保ちます。共有リンクは画面にも表示し、コピー機能を使えない場合にもURLを確認できます。

## 写真・地図・出典

写真は表示枠に合わせてトリミングします。Commons の写真には元のページ、撮影者、ライセンス、縮小・トリミングの記載を添えます。Google が配信する地図・写真の表示には、提供元の表記を残します。提供元の名称・撮影者・ライセンス名を、アプリの都合で翻訳しません。

写真の比較では、写真で見える共通点と違いを説明し、静かさや混雑を画像だけで断定しません。サンプル、Mapsからの候補、写真の比較、地形の試験的な探索が、それぞれ何を根拠にしているかを明示します。

## 動きと仕上げ

動きは、選択、ホバー、読み込み、通知を伝えるために使います。利用者の依頼による3D地球儀では、選んだ地点への移動を2.2秒のカメラ移動で示します。地形は表示用の範囲と画面の縦横比から距離を計算し、真上から見ます。画面の幅が変わった場合も範囲が収まるように調整します。大きな装飾の動きで写真や地図を邪魔しません。動きを減らす設定では、カメラの位置を即時に切り替え、移動・拡大や読み込みのアニメーションを抑えます。

幅360・390・768・1280・1440pxで、写真の読み込み、文言、ページ全体の横方向のはみ出しを確認します。今回の拡張は既存の構成を維持するため、新規の品質カード・comp・seedロールの対象外です。実際の画面と検証結果は `.impeccable/review/` と `VERIFICATION.md` を参照してください。


写真の入力には専用のドロップエリアを置きます。通常は2pxの点線、背景はpaper。マウスを重ねたとき、キーボードのフォーカスがあるとき、ファイルをドラッグしている間は、greenの実線とmintの背景に変えます。ドラッグ中はドロップを促す文言も表示します。「写真を選ぶ」を残し、スマートフォンやキーボードからも同じ操作ができます。ファイル名は折り返して表示し、写真は1枚ずつ受け付けます。

絞り込み条件は「条件を追加して絞り込む」の中にまとめ、初期状態では閉じます。選んだ条件の数は見出しに表示します。検索を始めたら、幅900px未満では結果の見出しへ、それ以上では地図と候補の領域へ移動します。動きを減らす設定では即時に移動します。検索に失敗したときは、エラーの表示位置へ即時に戻します。
