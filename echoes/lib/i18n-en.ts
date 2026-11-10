/** 英語表示の訳。キーは画面の日本語そのもの。{名前} は差し込む値。 */
export const en: Record<string, string> = {
  // Header, navigation and storage status
  'Google アカウントに保存': 'Saved to your Google account',
  'Firestore に保存': 'Saved to Firestore',
  保存先を接続中: 'Connecting to storage',
  保存先の接続を確認してください: 'Check the storage connection',
  このブラウザーに保存: 'Saved in this browser',
  場所を探す画面へ移動: 'Skip to the search',
  'Elsewhere のホーム': 'Elsewhere home',
  メインメニュー: 'Main menu',
  見つける: 'Discover',
  保存した場所: 'Saved',
  使い方: 'How it works',
  表示言語: 'Display language',
  '表示言語: {name}': 'Display language: {name}',

  // Intro
  '次に行きたい場所を、': 'Places to visit next, ',
  '少しずつ。': 'one at a time.',
  '好きな場所の、': 'Beyond the places ',
  'その先へ。': 'you love.',
  '気になる場所を残して、次の散歩や旅のきっかけに。':
    'Keep the places that catch your eye for your next walk or trip.',
  'あの場所の好きなところを、まだ知らない街で見つけよう。':
    'Find what you love about a place in a town you have not visited yet.',
  '川辺の風景、木陰、街並み。': 'Riversides, shade, streetscapes.',
  '好きな過ごし方から、行き先を探す。': 'Find somewhere new from how you like to spend time.',

  // Search methods and photo search settings
  似た場所の探し方: 'How to find similar places',
  雰囲気から: 'By atmosphere',
  写真の風景から: 'By photo',
  地形から: 'By terrain',
  写真の比較条件: 'Photo comparison settings',
  選んだ写真から風景を比べます: 'Comparing scenery with your photo',
  写真はアプリが探します: 'The app finds the photos',
  '登録済みの Commons 写真 {v0} 地点を比較します。':
    'Compares verified Commons photos of {v0} places.',
  '登録済みの Commons 写真を比較します。': 'Compares verified Commons photos.',
  '節約モードでは登録写真を優先します。': 'Cost-saving mode uses the prepared photos first.',
  '検索時に新しい候補の写真も探します。': 'New candidate photos are also searched for.',
  '比重を調整（写真 {v0}：特徴 {v1}）': 'Adjust weighting (photo {v0} : features {v1})',
  '写真の近さ {v0}：選んだ特徴 {v1}': 'Photo similarity {v0} : chosen features {v1}',
  高速検索: 'Fast search',
  アップロードした写真から比較: 'Comparing with your uploaded photo',
  '撮影場所は未指定です。候補の場所だけを地図に表示します。':
    'The photo location is not specified. Only the candidates are shown on the map.',
  '出発点を確認中…': 'Checking the starting point…',
  '似た場所を探しています…': 'Finding similar places…',
  出発点を更新: 'Update starting point',
  似た場所を探す: 'Find similar places',

  // Starting point and preferences
  出発点にした場所: 'Starting point',
  地図で選んだ場所: 'Place picked on the map',
  北緯: 'N',
  南緯: 'S',
  東経: 'E',
  西経: 'W',
  'どんなところが好きですか？': 'What do you like about it?',
  閉じる: 'Close',
  変更: 'Change',
  '次の場所でも大切にしたい特徴を選んでください。':
    'Choose what you want to keep in the next place.',
  '特徴は一つ以上選んでください。': 'Choose at least one feature.',
  '特徴を変えたら、もう一度検索してください。': 'After changing features, search again.',
  '特徴を変えると、候補の並び順も変わります。':
    'Changing features also changes the order of results.',
  '好きな特徴を選んで、検索してみてください。': 'Choose the features you like and search.',
  '似ているところも、違うところも。': 'What is similar, and what is different.',
  'その街らしさを楽しむきっかけに。': "A starting point for enjoying each town's character.",

  // Results area
  保存した場所の一覧: 'Saved places',
  似た場所の候補: 'Similar places',
  '選んだ写真と Commons の写真を比較': 'Comparing your photo with Commons photos',
  'Commons の写真から比較': 'Comparing Commons photos',
  'Google Maps の情報から検索': 'Searching with Google Maps',
  使い方を試せるサンプル: 'Sample data to try the app',
  検索結果について: 'About these results',
  結果の表示方法: 'Result view',
  地球儀: 'Globe',
  地図: 'Map',
  一覧: 'List',
  この場所を詳しく: 'View details',
  共有された検索結果です: 'Shared search results',
  '共有した人の写真検索の結果を表示しています。写真で比べた理由を見るには、「似た場所を探す」でもう一度検索してください。同じ条件の結果が残っていれば、すぐに表示されます。':
    'These are the photo search results of the person who shared this link. To see why the photos were matched, search again with “Find similar places”. If the same search was run recently, the results appear right away.',
  写真の近さを順位に反映しています: 'Photo similarity is part of the ranking',
  '今回は、場所の特徴から比較しています': 'This time, places were compared by their features',
  '写真 {v0} 地点を比較。写真の近さ {v1}：選んだ特徴 {v2}。':
    'Compared photos of {v0} places. Photo similarity {v1} : chosen features {v2}.',
  '新しく見つけた {v0} 地点のうち、写真を比較できたのは {v1} 地点です。':
    'Of {v0} newly found places, {v1} could be compared by photo.',
  '似ている度合いは、実測の一致率ではありません。': 'Similarity is not a measured match rate.',
  '24時間以内の同じ条件の検索結果を再利用しました。':
    'Reused results from the same search in the last 24 hours.',
  '写真の地形や構図を {v0} 候補で見比べています。':
    'Terrain and composition were compared for {v0} candidates.',
  '被写体の補助情報も {v0} 候補に使用しました。':
    'Subject labels were also used for {v0} candidates.',
  '被写体の補助情報が不足する場合は、埋め込みと写真の見比べで比較します。':
    'Where subject labels are missing, embeddings and side-by-side photo checks are used.',
  '登録候補は BigQuery から取得': 'Catalog loaded from BigQuery',
  登録候補はローカルから取得: 'Catalog loaded locally',
  気になっている場所: 'Places you saved',
  'あの場所に通じる、別の場所': 'Other places with something in common',
  '{v0} 件の場所を保存しています。': '{v0} saved places.',
  'Commons の写真を比べ、共通点と違いを調べています。':
    'Comparing Commons photos for similarities and differences.',
  'Google Maps を参照して、共通点と違いを調べています。':
    'Checking Google Maps for similarities and differences.',
  '共通する特徴と、その場所ならではの違いを比べてみてください。':
    'Compare what they share and what makes each place different.',
  検索のリンクをコピー: 'Copy a link to this search',
  検索を共有: 'Share search',
  この検索の共有リンク: 'Link to this search',
  この検索を開く: 'Open this search',
  '場所を調べています。少し時間がかかることがあります。':
    'Looking up places. This can take a little while.',
  検索を中止: 'Cancel search',
  検索中: 'Searching',
  '気になる場所を、ここに。': 'Keep places here.',
  '条件に合う写真の候補がありません。': 'No photo matches these conditions.',
  'まずは、好きな場所から。': 'Start with a place you love.',
  '探す範囲を広げてみませんか。': 'Try a wider area.',
  '候補のしおりを押すと、あとで見返せます。': 'Tap the bookmark on a result to find it here later.',
  '比較した候補の中に、条件に合う写真がありません。気候や国の条件を見直してみてください。':
    'None of the compared candidates have a photo that fits. Try changing the climate or country conditions.',
  '出発点と残したい特徴を選び、「似た場所を探す」を押してください。地図から出発点を選ぶこともできます。':
    'Choose a starting point and the features to keep, then press “Find similar places”. You can also pick the starting point on the map.',
  'この地域には、ほかのサンプルがありません。世界中から探すか、別の街を選んでみてください。':
    'There are no other samples in this area. Search worldwide or choose another town.',
  場所を探す: 'Find places',
  絞り込み条件を確認: 'Review filters',
  世界中から探す: 'Search worldwide',
  '{v0}を詳しく見る': 'View details of {v0}',
  '{v0}の保存を取り消す': 'Remove {v0} from saved places',
  '{v0}を保存する': 'Save {v0}',
  '出発点から約 {v0} km': 'About {v0} km from the starting point',
  '{v0}年の気候区分': 'Climate class, {v0}',
  '国際観光客 約{man}万人（{year}年）': 'About {millions} million international visitors ({year})',
  写真の比較を含む順位: 'Ranked with photo comparison',
  'ほか {v0} 件': '{v0} more',
  選んだ特徴を考慮: 'Ranked by chosen features',
  風景の比較候補: 'Scenery candidate',
  '共通する特徴 {v0} 件': '{v0} shared features',
  詳しく見る: 'View details',
  共通点と違い: 'Similarities and differences',
  '雰囲気や共通点は AI の解釈です。静かさや混雑は、訪れる時期で変わります。':
    'Atmosphere and similarities are AI interpretations. Quietness and crowds change with the time of your visit.',
  'サンプルの比較は紹介用のものです。現地の混雑や天候を示す情報ではありません。':
    'Sample comparisons are for demonstration. They do not show local crowds or weather.',
  'Google Maps と Gemini で検索する': 'Search with Google Maps and Gemini',
  '好きな過ごし方から、次の行き先へ。': 'From how you like to spend time to where you go next.',
  写真の出典: 'Photo credits',
  プライバシー: 'Privacy',
  利用について: 'Terms of use',
  アカウント: 'Account',

  // How it works
  '好きな場所を、': 'Turn a place you love ',
  '次の旅の手がかりに。': 'into a clue for your next trip.',
  'Elsewhere は、好きな場所の雰囲気や過ごし方から、別の行き先を探すアプリです。':
    'Elsewhere finds new destinations based on the atmosphere of places you love and how you spend time there.',
  出発点を選ぶ: 'Choose a starting point',
  '地名を入力するか、地図の気になる地点を押してください。':
    'Type a place name or tap a spot on the map.',
  好きなところを選ぶ: 'Choose what you like',
  '水辺、緑、カフェなど、次の場所でも大切にしたい特徴を選びます。':
    'Pick the features you want in the next place, such as water, greenery or cafés.',
  共通点と違いを比べる: 'Compare similarities and differences',
  '検索結果から、似ている理由と違いを確認できます。気になる場所は保存しておきましょう。':
    'Each result explains what is similar and what differs. Save the ones you like.',
  '場所の情報と AI の解釈を分けて表示します':
    'Place information and AI interpretation are shown separately',
  'Google Maps で確認できる場所を候補にし、Gemini が共通点と違いを整理します。類似率の実測値や、現在の混雑を表すものではありません。サンプルでは {v0} 件の紹介用データを使います。':
    'Candidates are places found on Google Maps, and Gemini summarises what they share and how they differ. This is not a measured similarity score or current crowd information. The samples use {v0} demonstration places.',

  // Privacy
  '保存するもの、': 'What is saved, ',
  '使う情報。': 'and what is used.',
  '保存した場所は、場所の ID と保存日時を Firestore に記録します。検索条件も、このブラウザーにひもづく匿名のユーザー ID で保存します。Google Maps の写真や説明を、保存用のデータベースに複製しません。':
    'For saved places, the place ID and the time it was saved are stored in Firestore. Search settings are also stored under an anonymous user ID tied to this browser. Google Maps photos and descriptions are not copied into the database.',
  'Google でログインすると、名前、メールアドレス、プロフィール画像を受け取り、この画面の表示に使います。保存した場所と検索条件は Google アカウントにひもづき、別の端末でも使えます。ログアウトすると、このブラウザーの保存情報は消去します。':
    'If you sign in with Google, your name, email address and profile picture are received and used only to show them on screen. Saved places and search settings are linked to your Google account and available on other devices. Signing out clears what is saved in this browser.',
  '検索時は、選んだ出発点、地域、特徴を Google のサービスに送ります。共有リンクには、出発点の ID と検索条件を記録します。':
    'When you search, the starting point, area and features you chose are sent to Google services. Shared links store the starting point ID and search conditions.',
  '「現在地から調べる」を押したときだけ位置情報の許可を求め、取得した位置を Google の経路検索に送ります。現在地は保存しません。':
    'Location permission is requested only when you press “Directions from my location”, and the location is sent to Google route search. Your location is not saved.',
  '写真の比較では、利用条件を確認した Commons の写真だけを Google の画像解析に送ります。埋め込みと写真の出典をサーバーに保存して再利用します。Google Maps の写真から埋め込みを作ることはありません。':
    'For photo comparison, only Commons photos with verified licences are sent to Google image analysis. Their embeddings and credits are stored on the server for reuse. No embeddings are made from Google Maps photos.',
  'アップロード写真は位置情報などを除去して Google の解析へ送ります。元の画像と、その画像の埋め込みはサーバーや Firestore に保存せず、共有リンクにも含めません。':
    'Uploaded photos are sent to Google analysis with location data removed. The original image and its embedding are not stored on the server or in Firestore, and are not included in shared links.',
  '候補の評価は、このブラウザーに保存します。「評価を匿名で送って、検索の改善に使う」を選んだときだけ、場所の ID、選んだ特徴、評価、検索方法、送信日時を Firestore に記録します。アカウントの ID や写真は含めません。住所を出発点にした評価と、撮影場所が不明な写真からの評価は送りません。選択を外すと、このブラウザーに記録が残っている評価を Firestore からも削除します。':
    'Your ratings of results are stored in this browser. Only if you choose “Send ratings anonymously to improve search” are the place IDs, chosen features, rating, search type and time stored in Firestore. No account ID or photo is included. Ratings from searches that start at an address or at a photo with an unknown location are never sent. If you turn this off, ratings still recorded in this browser are also deleted from Firestore.',
  '広告やアクセス解析のコードは入れていません。サンプルで Google Maps が未設定の場合に限り、OpenStreetMap の地図を表示します。':
    'There is no advertising or analytics code. OpenStreetMap is shown only for the samples when Google Maps is not configured.',
  場所を探す画面に戻る: 'Back to search',

  // Photo credits and terms
  '写真から比較した結果には Commons の出典、撮影者、ライセンスを表示します。雰囲気から探した結果の写真は Google Places から取得し、撮影者のリンクを表示しています。サンプルの写真は Wikimedia Commons のものを、表示に合わせてトリミングしています。':
    'Photo search results show the Commons source, author and licence. Photos in atmosphere results come from Google Places and link to their authors. Sample photos are from Wikimedia Commons, cropped to fit.',
  元の写真を確認する: 'View the original photo',
  '訪ねる前に、': 'Before you go, ',
  'もう一度確認を。': 'check again.',
  'このアプリは、次に行く場所を考えるための試作版です。場所の雰囲気や似ている理由には、AI による解釈が含まれます。':
    'This app is a prototype for thinking about where to go next. Atmosphere and reasons for similarity include AI interpretation.',
  '現地の混雑、天候、立ち入りの条件は変わります。訪ねる前に、公式の案内や Google Maps で最新の情報を確認してください。':
    'Crowds, weather and access conditions change. Check official information or Google Maps before you visit.',
  '写真や地図、参照元の情報には、それぞれの提供元の利用条件が適用されます。':
    "Photos, maps and referenced information are subject to each provider's terms.",
  'ページが見つかりません。': 'Page not found.',
  'リンク先を確認するか、ホームから場所を探してみてください。':
    'Check the link, or start a search from the home page.',

  // Account
  'アカウント：{v0}': 'Account: {v0}',
  'Google でログイン': 'Sign in with Google',
  ログイン中: 'Signed in',
  '保存した場所と検索条件は、この Google アカウントにひもづいています。別の端末でも、同じアカウントでログインすると使えます。':
    'Saved places and search settings are linked to this Google account. Sign in with the same account to use them on other devices.',
  'ログアウトしています…': 'Signing out…',
  ログアウト: 'Sign out',
  '縮小・トリミングあり': 'Resized and cropped',

  // Destination search
  世界中: 'Worldwide',
  '探す地域・街': 'Area or town to search',
  '世界中、北海道、ソウルなど': 'Worldwide, Hokkaido, Seoul…',
  地域の候補を閉じる: 'Close area suggestions',
  地域の候補を開く: 'Open area suggestions',
  探す地域の候補: 'Area suggestions',
  '入力した地名で検索できます。': 'You can search with the name you typed.',
  アジア: 'Asia',
  ヨーロッパ: 'Europe',
  アフリカ: 'Africa',
  北アメリカ: 'North America',
  南アメリカ: 'South America',
  オセアニア: 'Oceania',
  日本: 'Japan',
  北海道: 'Hokkaido',
  ソウル: 'Seoul',
  東京: 'Tokyo',
  京都: 'Kyoto',
  サモア: 'Samoa',
  パラオ: 'Palau',
  セーシェル: 'Seychelles',

  // Globe and map
  Googleの3D地球儀: 'Google 3D globe',
  '3D表示を利用できません。上の「地図」に切り替えてください。':
    '3D view is not available. Switch to “Map” above.',
  '3D地球儀を読み込めません。「地図」でも候補を確認できます。':
    'The 3D globe could not load. You can also see the results on the map.',
  '3D地球儀で場所を比べる': 'Compare places on the 3D globe',
  '地球から、好きな場所へ': 'From the globe to the places you love',
  地球全体: 'Whole globe',
  写真の撮影場所は未指定です: 'The photo location is not specified',
  出発点へ近づく: 'Go to starting point',
  '3D地球儀を読み込んでいます…': 'Loading the 3D globe…',
  '選んだ場所へ移動しています…': 'Moving to the selected place…',
  '動きを減らす設定で表示しています。': 'Shown with reduced motion.',
  '場所を選ぶと、地球儀から風景へ近づきます。': 'Choose a place to zoom in from the globe.',
  地球儀で移動する候補: 'Places to visit on the globe',
  'Google Maps を表示できませんでした。': 'Google Maps could not be shown.',
  'Google Maps を表示できませんでした。キーと参照元の設定を確認してください。':
    'Google Maps could not be shown. Check the API key and referrer settings.',
  '地図を読み込めませんでした。下の一覧から場所を確認できます。':
    'The map could not load. You can see the places in the list below.',
  '地図を表示できませんでした。下の一覧から場所を確認できます。':
    'The map could not be shown. You can see the places in the list below.',
  '出発点：{v0}': 'Starting point: {v0}',
  '場所を選ぶ：{v0}': 'Select: {v0}',
  出: 'S',
  出発点と候補の場所: 'Starting point and results',
  サンプルの地図: 'Sample map',
  地図を押して出発点を選ぶ: 'Tap the map to choose a starting point',
  航空写真: 'Satellite',
  すべての場所が見えるようにする: 'Show all places',
  地図を拡大: 'Zoom in',
  地図を縮小: 'Zoom out',
  'この場所を確認しています…': 'Checking this place…',
  出発点: 'Starting point',
  候補の場所: 'Result',
  '地図を読み込んでいます…': 'Loading the map…',
  'Google Maps の接続を確認してください。各候補のリンクからも場所を開けます。':
    'Check the Google Maps connection. You can also open each place from its link.',

  // Photo upload
  '写真は1枚ずつ追加してください。': 'Add one photo at a time.',
  自分の写真から探す: 'Search with your own photo',
  比較したい写真: 'Photo to compare',
  ここにドロップして写真を選ぶ: 'Drop the photo here',
  別の写真をドロップして差し替える: 'Drop another photo to replace it',
  '写真をここにドラッグ＆ドロップ': 'Drag and drop a photo here',
  'ボタンから選ぶこともできます。': 'Or choose one with the button.',
  写真を選ぶ: 'Choose photo',
  '選択中：{v0}': 'Selected: {v0}',
  写真を選んでいません: 'No photo selected',
  'JPEG・PNG・WebP、8 MB・2,400万画素以内。': 'JPEG, PNG or WebP, up to 8 MB and 24 megapixels.',
  '登録写真は{v0}地点です。': 'Prepared photos cover {v0} places.',
  '検索すると、位置情報などを取り除いた画像を Google に送って解析します。アップロードした写真とその埋め込みは保存しません。':
    'When you search, the image is sent to Google for analysis with location data removed. Your photo and its embedding are not stored.',
  '自分で撮影した写真、または画像解析に使える権利を持つ写真です。Google Maps / Google Earth の画面画像は使いません。':
    'I took this photo myself or have the right to use it for image analysis. It is not a screenshot of Google Maps or Google Earth.',
  写真を取り消して地名から探す: 'Remove photo and search by place name',

  // Place details
  '{v0}の詳しい情報': 'Details of {v0}',
  写真に写っている共通点: 'What the photos share',
  '写真の埋め込みで順位を付けました。写真の共通点を説明する処理は利用できませんでした。':
    'Ranked by photo embeddings. An explanation of what the photos share was not available.',
  写真で見える違い: 'Visible differences',
  写真だけでは分からないこと: 'What photos cannot tell you',
  '静かさや混雑、歩きやすさは、写真だけでは判断できません。下の特徴は紹介用の資料をもとにした解釈です。':
    'Quietness, crowds and walkability cannot be judged from photos. The features below are interpretations based on reference material.',
  比べた写真の出典: 'Compared photos',
  '利用者がアップロードした写真。元の画像と埋め込みは保存しません。':
    'Photo uploaded by you. The original and its embedding are not stored.',
  '候補：{v0}': 'Result: {v0}',
  '写真の近さ {v0}：選んだ特徴 {v1}。順位を決める手がかりで、一致率ではありません。':
    'Photo similarity {v0} : chosen features {v1}. This guides the ranking and is not a match rate.',
  '候補の過ごし方（資料からの解釈）': 'How to spend time here (interpreted from sources)',
  '過ごし方の共通点（資料からの解釈）': 'Shared ways to spend time (interpreted from sources)',
  似ているところ: 'What is similar',
  ひと味違うところ: 'What is different',
  '根拠を確認できなかった過ごし方の特徴は、不明として扱っています。':
    'Features without confirmed evidence are treated as unknown.',
  '訪ねるなら、このあたりから': 'Where to start',
  'Google Maps の参照元': 'Google Maps sources',
  場所の参考情報: 'References',
  '写真の共通点と違いは、比較した写真をもとに AI が整理しています。過ごし方の特徴には、紹介用の資料をもとにした解釈が含まれます。':
    'Similarities and differences in the photos are summarised by AI from the compared photos. Features include interpretation of reference material.',
  '共通点や雰囲気は、Google Maps の情報をもとに AI が整理したものです。静かさや混雑は、時間帯や季節によって変わります。':
    'Similarities and atmosphere are summarised by AI from Google Maps information. Quietness and crowds vary by time of day and season.',
  'サンプルの特徴と比較は、紹介用に整理したものです。現地の混雑や天候を示す情報ではありません。':
    'Sample features and comparisons are for demonstration. They do not show local crowds or weather.',
  '写真の出典・利用条件': 'Photo source and licence',
  'Google Maps で開く': 'Open in Google Maps',
  '保存しています…': 'Saving…',
  保存を取り消す: 'Remove from saved',
  この場所を保存: 'Save this place',
  現在地からの行き方: 'Directions from your location',
  '現在地を取得して Google の経路検索に送ります。位置情報は保存しません。':
    'Your location is sent to Google route search. It is not saved.',
  '経路を調べています…': 'Finding a route…',
  現在地から調べる: 'Directions from my location',

  // Country statistics
  '国・地域の参考統計': 'Country statistics',
  '地点ごとの水質・混雑・安全性を示すものではありません。水質は河川・湖沼・地下水域の統計で、海水浴場の水質ではありません。':
    'These do not describe water quality, crowds or safety at each place. Water quality covers rivers, lakes and groundwater, not beaches.',
  '{v0} {v1}（{v2}年・国単位）': '{v0} {v1} ({v2}, national)',
  '{v0}：': '{v0}: ',
  データ不明: 'No data',
  人口密度: 'Population density',
  水質統計: 'Water quality',
  殺人発生率: 'Homicide rate',
  '人/km²': 'people/km²',
  '%': '%',
  '件/10万人': 'per 100,000 people',
  '{v0}の風景': 'Scenery of {v0}',
  '写真：{v0}': 'Photo: {v0}',

  // Region selector
  '範囲を選び直してください。': 'Select the area again.',
  '航空写真を表示できません。下の緯度・経度でも範囲を指定できます。':
    'Satellite imagery is not available. You can also enter the area with the latitude and longitude below.',
  '範囲を確認してください。': 'Check the area.',
  比較する衛星データの範囲: 'Satellite data area to compare',
  比較元の範囲: 'Reference area',
  '航空写真の対角となる2点を押して、四角い範囲を選びます。':
    'Tap two opposite corners on the satellite view to select a rectangle.',
  選択を中止: 'Cancel selection',
  地図で範囲を選ぶ: 'Select area on map',
  '2点目を押してください。': 'Tap the second corner.',
  '1点目を押してください。地図は2本指で移動できます。':
    'Tap the first corner. Move the map with two fingers.',
  '枠内の衛星特徴を比較します。範囲は下の数値でも変更できます。':
    'Satellite features inside the box are compared. You can also adjust the area with the numbers below.',
  範囲を選ぶGoogle衛星表示: 'Google satellite view for selecting an area',
  北端の緯度: 'North latitude',
  南端の緯度: 'South latitude',
  西端の経度: 'West longitude',
  東端の経度: 'East longitude',
  '約 {v0} × {v1} km（{v2} km²）を選択。表示はGoogleの航空写真、比較は2024年のEarth Engine衛星観測です。表示画像を取得・解析することはありません。':
    'About {v0} × {v1} km ({v2} km²) selected. The view is Google satellite imagery; the comparison uses 2024 Earth Engine satellite observations. The displayed imagery is never captured or analysed.',

  // Result feedback
  候補の評価: 'Rate this result',
  探している場所に近いですか: 'Is this close to what you are looking for?',
  似ている: 'Similar',
  あまり似ていない: 'Not very similar',
  '地形・風景が違う': 'Different terrain or scenery',
  'このブラウザーの次の並び順に反映します。写真は記録しません。':
    'Your rating changes the order of results in this browser. No photo is recorded.',
  '評価はこのブラウザーに保存し、自動では送信しません。':
    'Ratings are kept in this browser and not sent automatically.',
  '評価を反映しました。': 'Rating applied.',
  '評価を保存できませんでした。ブラウザーの保存設定を確認してください。':
    'The rating could not be saved. Check your browser storage settings.',
  '評価を匿名で送って、検索の改善に使う': 'Send ratings anonymously to improve search',
  '送るのは場所の ID、選んだ特徴、評価、検索方法だけです。アカウントや写真は送りません。チェックを外すと、送った評価を削除します。':
    'Only place IDs, chosen features, the rating and search type are sent. No account or photo is sent. Unticking deletes the ratings you sent.',
  'この検索は出発点が住所か撮影場所の不明な写真なので、評価を送りません。':
    'This search starts at an address or at a photo with an unknown location, so ratings are not sent.',
  評価データを書き出す: 'Export ratings',

  // Scenery
  風景の手がかり: 'Scenery clues',
  海の色: 'Sea colour',
  街の雰囲気: 'Townscape',
  確認できません: 'Unknown',
  '（写真での観察）': ' (seen in photo)',
  '（Maps の資料からの解釈）': ' (interpreted from Maps sources)',
  街並みの参考情報: 'Townscape source',
  '撮影時の光や構図、資料による見え方です。現在の水質・混雑・治安は判断しません。':
    'This reflects light, composition and sources at the time. Current water quality, crowds and safety are not judged.',
  指定しない: 'Any',
  比較元の写真に近い色: 'Close to the reference photo',
  '確認済みの写真に写る色で比べます。天候・光・撮影方法で変わり、水質や遊泳可否は示しません。':
    'Compared by the colour in verified photos. It changes with weather, light and camera, and says nothing about water quality or swimming.',
  比較元の街並みに近い: 'Close to the reference townscape',
  '写真に見える建物・緑・街路、または Maps の参照情報から整理します。静かさ・混雑・治安は判断しません。':
    'Based on buildings, greenery and streets visible in photos, or on Maps sources. Quietness, crowds and safety are not judged.',
  ターコイズ: 'Turquoise',
  青: 'Blue',
  濃い青: 'Deep blue',
  緑: 'Green',
  灰色: 'Grey',
  茶色: 'Brown',
  歴史ある街並み: 'Historic streets',
  現代的な街並み: 'Modern streets',
  低層の住宅街: 'Low-rise residential',
  緑の多い街並み: 'Green streets',
  '港町・海沿い': 'Harbour or seaside',
  '小さな町・集落': 'Small town or village',
  海の写り込みなし: 'No sea in view',
  不明: 'Unknown',
  街並みの写り込みなし: 'No townscape in view',
  '写真の主な景観は海ではありません。': 'The main scenery in the photo is not the sea.',
  '・': ', ',

  // Filters
  条件を追加して絞り込む: 'Add filters',
  条件で絞り込む: 'Filters',
  '絞り込み {v0}件': 'Filters: {v0}',
  '{v0}件選択中': '{v0} selected',
  候補の絞り込み: 'Filters',
  気候区分: 'Climate class',
  '比較元と同じ（{v0}）': 'Same as the starting point ({v0})',
  比較元と同じ: 'Same as the starting point',
  '撮影場所は未指定です。気候区分は直接選べます。':
    'The photo location is not specified. You can choose a climate class directly.',
  '出発点：{v0} · {v1}{v2}': 'Starting point: {v0} · {v1}{v2}',
  '（最寄りの陸地）': ' (nearest land)',
  '比較元の分類はデータで確認します。': "The starting point's class is looked up from data.",
  '1991〜2020年の分類': 'Köppen–Geiger classes, 1991–2020',
  '観光客数が少なめの国・地域から探す': 'Search countries with fewer tourists',
  '国際観光客数100万人未満。': 'Fewer than 1 million international arrivals, based on',
  世界銀行の2019年統計: 'World Bank 2019 data',
  'で比較します。': '.',
  '2020〜2024年の最新公表値を国単位で比較します。地点の混雑、水の透明度・遊泳可否、旅行の安全性は判断しません。':
    'Compares the latest national figures from 2020 to 2024. Local crowds, water clarity, swimming and travel safety are not judged.',
  国の人口密度: 'Country population density',
  '100人/km²未満': 'Under 100 people/km²',
  '500人/km²以上': '500 people/km² or more',
  '良好な水域の割合が80%以上の国':
    'Countries where at least 80% of water bodies are in good condition',
  '河川・湖沼・地下水域のうち、水質基準を満たす割合。':
    'Share of rivers, lakes and groundwater that meet water quality standards.',
  水質統計の定義: 'Definition',
  殺人発生率が10万人あたり3件未満の国: 'Countries with fewer than 3 homicides per 100,000 people',
  '治安を考えるための一つの統計です。紛争・盗難・災害は含みません。':
    'One statistic for thinking about safety. It does not cover conflict, theft or disasters.',
  'UNODC・世界銀行': 'UNODC and World Bank',
  'データ不明の候補も、確認できた候補の後に表示する':
    'Also show places with unknown data, after confirmed ones',

  // Source search
  '候補を取得できませんでした。': 'Suggestions could not be loaded.',
  '好きな場所・出発点': 'A place you love',
  '例：ニューハウン、コペンハーゲン': 'e.g. Nyhavn, Copenhagen',
  '場所を確認しています…': 'Checking the place…',
  出発点の候補: 'Starting point suggestions',
  'Google Maps で場所を探す': 'Search places on Google Maps',
  サンプルの場所から選ぶ: 'Choose a sample place',
  '候補を探しています…': 'Searching…',
  '地名を 2 文字以上で入力してください。': 'Type at least 2 characters.',
  '候補が見つからない場合は、市区町村名も入れて検索できます。':
    'If nothing is found, add the city or town name.',

  // Terrain explorer
  比較元の範囲の中心: 'Centre of the reference area',
  地形の参照地点: 'Terrain reference point',
  '地形を解析できませんでした。': 'The terrain could not be analysed.',
  衛星データで地形を探す: 'Find terrain with satellite data',
  世界の似た地形を探す: 'Find similar terrain around the world',
  登録地形と指定範囲の衛星候補を比較:
    'Compares catalogued terrain and satellite samples in the chosen radius',
  '比較元から100 km以上離れた登録地形と、指定範囲の衛星候補を探します。比較元の範囲と、近接した地点は除外します。衛星データは近さの手がかりとして使います。':
    'Searches catalogued terrain at least 100 km from the reference, plus satellite samples in the chosen radius. The reference area and nearby places are excluded. Satellite data is used as a clue to similarity.',
  地形の参照例: 'Terrain examples',
  '{v0}の例': '{v0} example',
  '参照例を表示：{v0}': 'Show example: {v0}',
  群島: 'Archipelago',
  ストックホルム群島周辺: 'Stockholm archipelago',
  '島と水域を含む範囲を選びます。島の個数や並び方を確定する判定は行いません。':
    'Select an area with islands and water. The number and arrangement of islands are not determined.',
  ラグーン: 'Lagoon',
  'サン・エリホ・ラグーン周辺': 'San Elijo Lagoon',
  '海岸近くの水域と陸地を含めて選びます。海とのつながりは地図や現地の資料でも確認してください。':
    'Select coastal water and land together. Check maps or local sources for the connection to the sea.',
  環礁: 'Atoll',
  ティケハウ環礁周辺: 'Tikehau Atoll',
  '環状の陸地・浅瀬・内側の水域を含めます。深い海は衛星埋め込みの対象外なので、データのある部分だけを比較します。':
    'Include the ring of land, shallows and inner water. Deep ocean is not covered by satellite embeddings, so only areas with data are compared.',
  メサ: 'Mesa',
  'メサ・ヴェルデ周辺': 'Mesa Verde',
  '平らな頂部と周囲の斜面が手がかりです。種類の確定には標高や地質の確認が必要です。':
    'The flat top and surrounding slopes are the clues. Confirming the type needs elevation and geology checks.',
  ビュート: 'Butte',
  'モニュメント・バレー周辺': 'Monument Valley',
  '孤立した頂部と斜面を含めます。幅と高さによるメサとの区別は自動判定しません。':
    'Include the isolated top and its slopes. It is not automatically told apart from a mesa by width and height.',
  衛星データの参照方法: 'Satellite reference method',
  航空写真で範囲を選ぶ: 'Select an area on satellite view',
  '地点の周辺100 mを使う': 'Use 100 m around a point',
  参照地点の緯度: 'Reference latitude',
  参照地点の経度: 'Reference longitude',
  '上の地域・気候区分・国の条件でも絞り込めます。地形の輪郭の自動抽出や、レグールの土壌判定は未対応です。':
    'You can also filter by the area, climate and country conditions above. Automatic outline extraction and regur soil detection are not supported.',
  地形候補の探し方: 'How to find terrain',
  登録地形と指定範囲を探す: 'Catalogued terrain and chosen radius',
  登録地形だけを比べる: 'Catalogued terrain only',
  探索中心の緯度: 'Search centre latitude',
  探索中心の経度: 'Search centre longitude',
  '探索半径（km）': 'Search radius (km)',
  探索中心を比較元に戻す: 'Reset search centre to reference',
  '衛星候補は検索時に探し、未分類として表示します。探索半径は150〜1,000 kmです。':
    'Satellite candidates are found at search time and shown as unclassified. The radius is 150–1,000 km.',
  '探索中心の緯度・経度と、半径150〜1,000 kmを確認してください。':
    'Check the search centre and a radius of 150–1,000 km.',
  'Earth Engine の接続を確認してください': 'Check the Earth Engine connection',
  '利用登録または権限が必要です。解析結果はまだありません。':
    'Registration or permission is required. There are no results yet.',
  接続を再確認: 'Check connection again',
  '別の地形と比較しています…': 'Comparing with other terrain…',
  '接続を確認しています…': 'Checking connection…',
  別の場所にある似た地形を探す: 'Find similar terrain elsewhere',
  解析を中止: 'Cancel analysis',
  '{v0} 件の地形候補': '{v0} terrain matches',
  '{v0}年の衛星埋め込みを使用。': 'Uses {v0} satellite embeddings. ',
  '参照範囲のデータ被覆率は約{v0}%。類似率ではありません。':
    'About {v0}% of the reference area has data. This is not a similarity score. ',
  'データのある部分が少ないため、範囲全体を表す比較にはなっていません。':
    'Little of the area has data, so the comparison does not represent the whole area.',
  '比較元の気候：{v0} · {v1}（範囲内の陸地の分類）':
    'Reference climate: {v0} · {v1} (land in the area)',
  '条件に合う地形候補がありません。探索中心・半径や条件を変えて試してください。':
    'No terrain fits these conditions. Try another search centre, radius or conditions.',
  地形候補の地図表示: 'Terrain matches on the map',
  '表は左右にスクロールできます。': 'Scroll the table sideways.',
  '別の地形・地域': 'Terrain or area',
  比較元から: 'Distance',
  平均標高: 'Mean elevation',
  平均傾斜: 'Mean slope',
  水域の観測頻度: 'Water frequency',
  未分類の衛星候補: 'Unclassified satellite candidate',
  登録地形: 'Catalogued terrain',
  'Google Earth で見る': 'View in Google Earth',
  '水域の観測頻度は過去の観測値です。現在の水深や類似率を示しません。標高の欠測は「—」で示します。':
    'Water frequency is from past observations. It does not show current depth or similarity. Missing elevation is shown as “—”.',
  'BigQuery の地形カタログを使用。 ': 'Uses the BigQuery terrain catalog. ',

  // Messages from the app
  '共有された検索結果を開きました。': 'Opened the shared search results.',
  '共有された結果を読み込めませんでした。検索ボタンで候補を探せます。':
    'The shared results could not be loaded. You can search with the button.',
  '接続設定を確認できませんでした。': 'The connection settings could not be loaded.',
  '共有された検索が見つかりませんでした。': 'The shared search was not found.',
  '共有された検索条件を開きました。検索ボタンで候補を探せます。':
    'Opened the shared search. Press the search button to find places.',
  'Google への保存を開始できませんでした。': 'Saving to Google could not start.',
  'Google への接続を確認できませんでした。': 'Could not connect to Google.',
  '8 MB以内のJPEG・PNG・WebPを選んでください。': 'Choose a JPEG, PNG or WebP up to 8 MB.',
  '場所を確認できませんでした。': 'The place could not be found.',
  'この地点を確認できませんでした。': 'This spot could not be identified.',
  '地図で選んだ場所を出発点にしました。': 'Set the place picked on the map as the starting point.',
  'サンプルから出発点を選んでください。Google 検索では好きな場所を入力できます。':
    'Choose a starting point from the samples. With Google search you can type any place.',
  '出発点の地名を入れてください。': 'Enter a starting place.',
  '出発点を確認できませんでした。': 'The starting point could not be found.',
  '画像解析に利用できる写真であることを確認してください。':
    'Confirm that the photo can be used for image analysis.',
  '検索を完了できませんでした。': 'The search could not be completed.',
  '写真の解析を完了できませんでした。': 'The photo analysis could not be completed.',
  '写真の比較を完了できませんでした。': 'The photo comparison could not be completed.',
  '検索を中止しました。': 'Search cancelled.',
  'アップロード写真は共有リンクに含めません。地名で選んだ検索を共有してください。':
    'Uploaded photos are not included in shared links. Share a search that starts from a place name.',
  '検索結果つきのリンクをコピーしました。': 'Copied a link with the results.',
  '検索のリンクをコピーしました。': 'Copied a link to the search.',
  'アドレス欄の URL をコピーして共有できます。': 'Copy the URL in the address bar to share.',
  '共有リンクを作れませんでした。接続を確認してお試しください。':
    'The share link could not be created. Check your connection and try again.',
  '保存した場所を読み込めませんでした。接続を確認してください。':
    'Saved places could not be loaded. Check your connection.',
  'このブラウザーでは保存情報を保持できません。': 'This browser cannot keep saved data.',
  '検索条件を保存できませんでした。': 'Search settings could not be saved.',
  '保存した場所から削除しました。': 'Removed from saved places.',
  '気になる場所を保存しました。': 'Place saved.',
  'このブラウザーに保存しました。': 'Saved in this browser.',
  '保存を変更できませんでした。接続を確認して、もう一度お試しください。':
    'The change could not be saved. Check your connection and try again.',
  'Google への接続を確認できませんでした。ページを読み直してください。':
    'Could not connect to Google. Reload the page.',
  'ログインしました。このブラウザーの保存の一部を移せませんでした。':
    'Signed in. Some places saved in this browser could not be moved.',
  'Google アカウントでログインしました。': 'Signed in with Google.',
  'ログアウトしました。保存した場所は Google アカウントに残っています。':
    'Signed out. Your saved places remain in your Google account.',
  'ログアウトしましたが、保存先に接続できません。ページを読み直してください。':
    'Signed out, but storage is not reachable. Reload the page.',
  '評価を送信できませんでした。このブラウザーには保存しています。':
    'The rating could not be sent. It is still saved in this browser.',
  'このブラウザーでは設定を保存できません。': 'This browser cannot save the setting.',
  '送信した評価を削除できませんでした。時間をおいてもう一度お試しください。':
    'The sent ratings could not be deleted. Try again later.',
  'このブラウザーでは現在地を取得できません。Google Maps で行き方を確認できます。':
    'This browser cannot get your location. You can check directions in Google Maps.',
  '{v0}で約 {v1} 分・{v2} km': 'About {v1} min {v0} · {v2} km',
  徒歩: 'on foot',
  車: 'by car',
  '現在地を取得できませんでした。位置情報の許可を確認してください。':
    'Your location could not be found. Check location permission.',
  '経路を確認できませんでした。': 'A route could not be found.',
  '共有された結果を確認できませんでした。': 'The shared results could not be checked.',
  '検索結果を取得できませんでした。': 'Results could not be loaded.',
  アップロードした写真: 'Uploaded photo',
  場所は未指定: 'Location not specified',
  解析時に位置情報を除去: 'Location data removed before analysis',
  '写真の風景から候補を探します。場所の特定は行いません。':
    "Finds places from the scenery in your photo. The photo's location is not identified.",
  'ログイン用のウィンドウがブロックされました。ポップアップを許可して、もう一度お試しください。':
    'The sign-in window was blocked. Allow pop-ups and try again.',
  'Google ログインがまだ有効になっていません。Firebase の Authentication で Google を有効にしてください。':
    'Google sign-in is not enabled yet. Enable Google in Firebase Authentication.',
  'このアドレスからは Google ログインを使えません。Firebase の承認済みドメインを確認してください。':
    'Google sign-in is not available on this address. Check the authorised domains in Firebase.',
  'Google と通信できませんでした。接続を確認して、もう一度お試しください。':
    'Could not reach Google. Check your connection and try again.',
  'Google でログインできませんでした。少し待ってから、もう一度お試しください。':
    'Could not sign in with Google. Wait a moment and try again.',

  // Preferences
  水辺を歩きたい: 'Walk by the water',
  川や運河に沿って歩けること: 'Paths along rivers or canals',
  緑に囲まれたい: 'Be surrounded by green',
  '木々や庭園など、緑が身近にあること': 'Trees, gardens and greenery close by',
  のんびり過ごしたい: 'Take it slow',
  '立ち止まったり、ゆっくり眺めたりできること': 'Places to pause and take in the view',
  街歩きを楽しみたい: 'Explore on foot',
  歩いて景色や街並みを楽しめること: 'Scenery and streets to enjoy on foot',
  カフェに立ち寄りたい: 'Stop at a café',
  散歩の途中にひと息つけること: 'Somewhere to rest during a walk',
  歴史を感じたい: 'Feel the history',
  古い街並みや建物が残っていること: 'Old streets and buildings',

  // Sample places
  鴨川: 'Kamo River',
  '京都の街なかで、水と緑を身近に感じられる場所です。':
    'A place in central Kyoto where water and greenery feel close.',
  '出町柳の鴨川と高野川が合流するあたりから、川沿いの道を歩いてみてください。':
    'Start where the Kamo and Takano rivers meet near Demachiyanagi and walk the riverside path.',
  '運河や庭園よりも視界が開けた、街なかの河川敷です。':
    'An open riverbank in the city, with wider views than a canal or garden.',
  川沿いをゆっくり散歩するのに向いています: 'Good for a slow riverside walk',
  リュブリャニツァ川沿い: 'Ljubljanica riverside',
  リュブリャナ: 'Ljubljana',
  スロベニア: 'Slovenia',
  '川沿いの緑と旧市街の街並みを、一緒に楽しめます。':
    'Enjoy riverside greenery and the old town together.',
  '靴屋橋の周辺から川沿いを歩き、シュピツァのあたりへ。途中で旧市街にも立ち寄れます。':
    "Walk along the river from the Cobblers' Bridge towards Špica, with stops in the old town on the way.",
  '中心部は古い建物やカフェのテラスが川に近く、街並みを身近に感じます。静かさは場所や時間帯で変わります。':
    'In the centre, old buildings and café terraces sit close to the river, so the town feels near at hand. Quietness varies by place and time.',
  カフェに寄りながら川沿いを歩けます: 'Walk the river with café stops',
  清渓川: 'Cheonggyecheon',
  韓国: 'South Korea',
  'ソウルの街路より一段低いところを、小さな川が流れています。':
    'A small stream runs a level below the streets of Seoul.',
  '清渓広場から川に沿って東へ。橋や飛び石、水辺の道から、ソウルの街を眺められます。':
    'Head east along the stream from Cheonggye Plaza. Bridges, stepping stones and waterside paths give views of the city.',
  '川幅が狭く、街路の下に整備された水辺です。中心部は人が多いこともあります。':
    'A narrow stream with a landscaped waterside below street level. The centre can be busy.',
  街なかで水辺の散歩を楽しめます: 'A waterside walk in the city',
  セーヌ川沿い: 'Banks of the Seine',
  パリ: 'Paris',
  フランス: 'France',
  '川沿いを歩くたびに、パリの街並みが見えてきます。': 'Paris unfolds as you walk along the river.',
  'パルク・リヴ・ド・セーヌの遊歩道から、シテ島や橋のある景色を眺めてみてください。':
    'From the Parc Rives de Seine promenade, take in the views of the Île de la Cité and the bridges.',
  '大きな建物や石造りの護岸が目立ち、芝生の河川敷は少なめです。混雑は場所や時間帯で変わります。':
    'Large buildings and stone embankments stand out, with little grassy bank. Crowds vary by place and time.',
  水辺で歴史ある街並みを楽しめます: 'Historic streets by the water',
  イザール川沿い: 'Isar riverside',
  ミュンヘン: 'Munich',
  ドイツ: 'Germany',
  '街の暮らしのすぐそばに、自然の川辺が広がります。':
    'A natural riverside right next to city life.',
  '中心部の南にあるフラウヒャー周辺へ。川沿いの道から、木々や砂利の河原を楽しめます。':
    'Head to the Flaucher area south of the centre. The riverside path offers trees and gravel banks.',
  '砂利の河原が広く、自然の川に近い景色です。旧市街の散策とは少し離れた過ごし方になります。':
    'Wide gravel banks make it feel like a natural river. It is a different outing from exploring the old town.',
  緑の多い川辺で過ごせます: 'Time on a green riverside',
  フォンデル公園: 'Vondelpark',
  アムステルダム: 'Amsterdam',
  オランダ: 'Netherlands',
  '芝生や曲がりくねった道があり、ゆっくり過ごせる公園です。':
    'A park with lawns and winding paths for an unhurried visit.',
  '東側の入口から、池や芝生をつなぐ道へ。中央の道だけでなく、脇道も歩いてみてください。':
    'Enter from the east and follow the paths between ponds and lawns. Try the side paths, not just the main one.',
  '川沿いではなく、池のある都市公園です。歩行者と自転車が同じ道を使う場所もあります。':
    'A city park with ponds rather than a river. Some paths are shared by walkers and cyclists.',
  緑の中で気ままに散歩できます: 'A relaxed walk among the green',
  上野公園: 'Ueno Park',
  '池の周りを歩きながら、お寺や博物館にも立ち寄れます。':
    'Walk around the pond and visit temples and museums too.',
  '不忍池の周りを散歩してから、公園内のお寺や博物館へ足を延ばせます。':
    "Stroll around Shinobazu Pond, then go on to the park's temples and museums.",
  '広い河川敷とは違い、文化施設が集まる公園です。催しや桜の時季には混み合います。':
    'Unlike a wide riverbank, this park gathers cultural sites. It gets busy during events and cherry blossom season.',
  散歩と文化施設巡りを楽しめます: 'Walks and museums',
  哲学の道: "Philosopher's Path",
  '小さな水路と木々に沿って、ゆっくり歩ける道です。':
    'A path for slow walks along a small canal and trees.',
  '銀閣寺から南禅寺にかけて、水路沿いの道を歩けます。周辺の小道にも立ち寄ってみてください。':
    'Walk the canal path from Ginkaku-ji to Nanzen-ji, and explore the lanes nearby.',
  '道も水路も幅が狭く、お寺が近くにあります。桜の時季は特に混み合います。':
    'Both the path and the canal are narrow, with temples nearby. It is especially busy in cherry blossom season.',
  京都の古い街並みをゆっくり歩けます: 'A slow walk through old Kyoto',
  ニューハウン: 'Nyhavn',
  コペンハーゲン: 'Copenhagen',
  デンマーク: 'Denmark',
  '色とりどりの古い建物が、港の水面に映ります。':
    'Colourful old buildings reflected in the harbour.',
  'コンゲンス・ニュートー広場から運河沿いを港の方へ。古い街並みや係留された船を眺められます。':
    'Walk from Kongens Nytorv along the canal towards the harbour, past old houses and moored boats.',
  '飲食店や船の往来がある、にぎやかな港です。緑の中で静かに過ごす川辺とは雰囲気が異なります。':
    'A lively harbour with restaurants and passing boats, quite different from a quiet green riverside.',
  カフェと色鮮やかな水辺の景色を楽しめます: 'Cafés and a colourful waterfront',
  リージェンツ運河: "Regent's Canal",
  ロンドン: 'London',
  イギリス: 'United Kingdom',
  'にぎやかなロンドンの中で、運河沿いの道を歩けます。':
    'A canal towpath in the middle of busy London.',
  'リージェンツ・パークやリトル・ベニス周辺の運河沿いへ。船や水辺の街並みは、歩く区間によって変わります。':
    "Walk the canal near Regent's Park or Little Venice. Boats and waterside streets change along the way.",
  '船も通る細い運河で、道は歩行者などが共用しています。路面や入りやすさ、混雑は区間によって異なります。':
    'A narrow canal used by boats, with a shared towpath. Surface, access and crowds vary by section.',
  大通りを離れて運河沿いを散歩できます: 'A canal walk away from the main roads',
  'ビシャン・アンモキオ公園': 'Bishan-Ang Mo Kio Park',
  シンガポール: 'Singapore',
  '広い緑地の中を、川がゆるやかに曲がって流れています。':
    'A river winds gently through wide green space.',
  '川沿いの道や芝生を歩けます。自然に近い川の形を取り入れた都市公園です。':
    'Walk the riverside paths and lawns of a city park built around a natural-style river.',
  '古い街並みのある川辺とは違い、熱帯の公園の景色が広がります。天候によって過ごしやすさが変わります。':
    'Unlike a riverside with old streets, this is a tropical park landscape. Comfort depends on the weather.',
  街の中で自然を身近に感じられます: 'Nature close by in the city',
  中之島公園: 'Nakanoshima Park',
  大阪: 'Osaka',
  '二つの川に挟まれた中之島で、庭園と水辺を楽しめます。':
    'Gardens and waterside on Nakanoshima, between two rivers.',
  '中之島の東側、バラ園の周辺から散歩できます。川の景色と歴史ある公共建築を眺められます。':
    'Start near the rose garden at the east end of Nakanoshima, with river views and historic public buildings.',
  '広い河川敷ではなく、整えられた庭園と都市の建物が近くにあります。':
    'Not a wide riverbank, but tidy gardens with city buildings close by.',
  '街歩きの途中に、緑の中でひと息つけます': 'A green break during a city walk',

  // Climate classes
  熱帯雨林: 'Tropical rainforest',
  熱帯モンスーン: 'Tropical monsoon',
  サバナ: 'Tropical savanna',
  高温砂漠: 'Hot desert',
  低温砂漠: 'Cold desert',
  高温ステップ: 'Hot steppe',
  低温ステップ: 'Cold steppe',
  '地中海性・暑夏': 'Mediterranean, hot summer',
  '地中海性・暖夏': 'Mediterranean, warm summer',
  '地中海性・冷夏': 'Mediterranean, cool summer',
  '温帯冬季少雨・暑夏': 'Dry-winter temperate, hot summer',
  '温帯冬季少雨・暖夏': 'Dry-winter temperate, warm summer',
  '温帯冬季少雨・冷夏': 'Dry-winter temperate, cool summer',
  温暖湿潤: 'Humid subtropical',
  '西岸海洋性・暖夏': 'Oceanic, warm summer',
  '西岸海洋性・冷夏': 'Subpolar oceanic',
  '冷帯夏季少雨・暑夏': 'Dry-summer continental, hot summer',
  '冷帯夏季少雨・暖夏': 'Dry-summer continental, warm summer',
  '冷帯夏季少雨・冷夏': 'Dry-summer subarctic',
  '冷帯夏季少雨・極寒冬': 'Dry-summer subarctic, very cold winter',
  '冷帯冬季少雨・暑夏': 'Dry-winter continental, hot summer',
  '冷帯冬季少雨・暖夏': 'Dry-winter continental, warm summer',
  '冷帯冬季少雨・冷夏': 'Dry-winter subarctic',
  '冷帯冬季少雨・極寒冬': 'Dry-winter subarctic, very cold winter',
  '冷帯湿潤・暑夏': 'Humid continental, hot summer',
  '冷帯湿潤・暖夏': 'Humid continental, warm summer',
  '冷帯湿潤・冷夏': 'Subarctic',
  '冷帯湿潤・極寒冬': 'Subarctic, very cold winter',
  ツンドラ: 'Tundra',
  氷雪: 'Ice cap',

  // Messages from the server
  '絞り込み条件を確認してください。': 'Check the filters.',
  '気候区分と国の条件を確認してください。': 'Check the climate and country conditions.',
  '海の色の条件を確認してください。': 'Check the sea colour condition.',
  '街の雰囲気の条件を確認してください。': 'Check the townscape condition.',
  'Google の AI 接続がまだ設定されていません。': 'The Google AI connection is not set up yet.',
  '検索条件を短くしてください。': 'Shorten the search conditions.',
  '出発点と探す地域、残したい特徴を選んでください。':
    'Choose a starting point, an area and the features to keep.',
  '出発点を選んでください。': 'Choose a starting point.',
  '出発点の気候区分を確認できません。条件を外すか、直接選んでください。':
    "The starting point's climate class is unknown. Remove the condition or choose a class directly.",
  'Google Maps の情報をもとに、AI が共通点と違いを整理しています。':
    'AI summarises similarities and differences from Google Maps information.',
  '検索結果を読み取れませんでした。もう一度お試しください。':
    'The results could not be read. Try again.',
  '緯度・経度を確認してください。': 'Check the latitude and longitude.',
  '場所の指定が長すぎます。': 'The place is too long.',
  '登録地点が見つかりませんでした。': 'The catalogued place was not found.',
  '場所の名前を入れるか、地図から地点を選んでください。':
    'Enter a place name or pick a spot on the map.',
  '場所の指定を読み取れませんでした。': 'The place could not be read.',
  '経路の指定を確認してください。': 'Check the route request.',
  '出発地、目的地、移動方法を確認してください。': 'Check the origin, destination and travel mode.',
  '地名を短くして、もう一度お試しください。': 'Shorten the place name and try again.',
  '場所の候補を取得できませんでした。': 'Place suggestions could not be loaded.',
  'Earth Engine の接続を確認できませんでした。':
    'The Earth Engine connection could not be checked.',
  '解析条件が長すぎます。': 'The analysis request is too long.',
  '比較元の緯度・経度と地形の種類を確認してください。':
    'Check the reference latitude, longitude and terrain type.',
  '海の色と街の雰囲気は写真・雰囲気検索の条件です。地形検索では条件を外してください。':
    'Sea colour and townscape apply to photo and atmosphere searches. Remove them for terrain search.',
  '探索の条件を確認してください。': 'Check the search conditions.',
  '探索範囲を確認してください。': 'Check the search area.',
  '節約モードのため、登録地形だけを比較しています。':
    'Cost-saving mode: only catalogued terrain is compared.',
  '比較元から100 km以上離れた登録地形を、領域の平均特徴・3×3の配置・標高や水域で比較しました。':
    'Compared catalogued terrain at least 100 km away using mean area features, a 3×3 layout, elevation and water.',
  '衛星候補は未分類です。選んだ地形の種類や輪郭の一致を保証しません。指定範囲内で標本を取り、候補の周辺領域を再比較しています。全世界や指定範囲の全地点を網羅する検索ではありません。':
    'Satellite candidates are unclassified and do not guarantee the same terrain type or outline. Samples are taken within the radius and their surroundings compared again. This does not cover every place in the world or the radius.',
  '地形の解析を完了できませんでした。参照範囲を変えてお試しください。':
    'The terrain analysis could not be completed. Try another reference area.',
  '検索条件が長すぎます。': 'The search request is too long.',
  '検索条件を確認してください。': 'Check the search conditions.',
  '検索条件を読み取れませんでした。': 'The search conditions could not be read.',
  '写真の解析が混み合っています。少し待ってお試しください。':
    'Photo analysis is busy. Wait a moment and try again.',
  'このアプリの画面から写真を選び直してください。': 'Choose the photo again from this app.',
  '写真を選んでください。': 'Choose a photo.',
  '写真の送信内容を読み込めませんでした。選び直してください。':
    'The photo could not be read. Choose it again.',
  '画像解析に利用できる写真を選び、確認欄にチェックしてください。':
    'Choose a photo you may use for image analysis and tick the confirmation box.',
  '好きな特徴を選んでください。': 'Choose the features you like.',
  '写真の解析を完了できませんでした。もう一度お試しください。':
    'The photo analysis could not be completed. Try again.',
  '参照元を確認できる候補が見つかりませんでした。出発点や探す地域を変えてお試しください。':
    'No results with verifiable sources were found. Try another starting point or area.',
  'AI モデルの設定を確認してください。': 'Check the AI model setting.',
  'Google の AI 接続が未設定です。': 'The Google AI connection is not set up.',
  'AI の検索が混み合っています。少し待ってからお試しください。':
    'AI search is busy. Wait a moment and try again.',
  'AI の検索を完了できませんでした。もう一度お試しください。':
    'AI search could not be completed. Try again.',
  'この場所の特徴を十分に確認できませんでした。別の場所を選んでみてください。':
    'Not enough could be confirmed about this place. Try another place.',
  '場所の検索がまだ設定されていません。Google Maps のサーバーキーを確認してください。':
    'Place search is not set up yet. Check the Google Maps server key.',
  '場所の検索が混み合っています。少し待ってからお試しください。':
    'Place search is busy. Wait a moment and try again.',
  '場所の情報を取得できませんでした。地名を詳しくして、もう一度お試しください。':
    'Place details could not be loaded. Make the name more specific and try again.',
  '場所を選び直してください。': 'Choose the place again.',
  '地図からの場所検索がまだ設定されていません。': 'Picking places on the map is not set up yet.',
  'この地点の情報が見つかりません。近くの公園や街の中を選んでみてください。':
    'Nothing was found at this spot. Try a nearby park or town.',
  '場所の位置情報を確認できませんでした。': "The place's location could not be confirmed.",
  '近くの公園や施設を選んでみてください。': 'Try a nearby park or landmark.',
  '場所が見つかりません。市区町村の名前も入れてみてください。':
    'Place not found. Try adding the city or town name.',
  '写真の指定を確認できません。': 'The photo request is not valid.',
  '写真を表示できませんでした。': 'The photo could not be shown.',
  '写真の配信元を確認できません。': 'The photo source could not be verified.',
  'この区間の経路は見つかりませんでした。Google Maps で別の移動方法を確認できます。':
    'No route was found. Check other travel modes in Google Maps.',
  '説明を日本語に整えられませんでした。もう一度お試しください。':
    'The description could not be prepared. Try again.',
  '写真は8 MB以内にしてください。': 'Photos must be 8 MB or smaller.',
  'JPEG・PNG・WebPの写真を選んでください。': 'Choose a JPEG, PNG or WebP photo.',
  '写真の形式を確認できませんでした。画像として保存し直してください。':
    'The photo format could not be read. Save it again as an image.',
  '写真を読み込めませんでした。2,400万画素以内のJPEG・PNG・WebPを選んでください。':
    'The photo could not be read. Choose a JPEG, PNG or WebP of up to 24 megapixels.',
  '地図上で範囲の対角となる2点を選んでください。': 'Choose two opposite corners on the map.',
  '緯度・経度と範囲を確認してください。日付変更線をまたぐ場合は、範囲を分けてください。':
    'Check the coordinates and area. If it crosses the date line, split it into two areas.',
  '縦・横とも100 m以上の範囲を選んでください。': 'Choose an area at least 100 m on each side.',
  '参照範囲は一辺40 km以内、面積900 km²以内にしてください。':
    'Keep the reference area within 40 km per side and 900 km².',
  '探索範囲の緯度・経度と半径150〜1,000 kmを確認してください。':
    'Check the search centre and a radius of 150–1,000 km.',
  '選んだ範囲に比較できる衛星データがありません。':
    'There is no satellite data to compare in the selected area.',
  '比較元の気候区分を確認できません。気候区分を直接選ぶか、条件を外してください。':
    'The reference climate class is unknown. Choose a class directly or remove the condition.',
  '比較元の衛星データがありません。': 'There is no satellite data for the reference.',
  'Commons の写真検索は待機中です（HTTP 429）。': 'Commons photo search is paused (HTTP 429).',
  '出典と利用条件を確認できない写真です。':
    'The source and licence of this photo could not be verified.',
  '写真のパスが正しくありません。': 'The photo path is not valid.',
  'Commons 以外の写真は解析できません。': 'Only Commons photos can be analysed.',
  '写真を読み込めませんでした。': 'The photo could not be loaded.',
  '写真が大きすぎます。': 'The photo is too large.',
  '画像埋め込みのモデルを確認してください。': 'Check the image embedding model.',
  '画像埋め込みのリージョンを確認してください。': 'Check the image embedding region.',
  '画像解析の利用枠に達しました。': 'The image analysis quota has been reached.',
  'Google の画像埋め込みを利用できませんでした。': 'Google image embeddings are not available.',
  '画像埋め込みの結果を確認できませんでした。': 'The image embedding result could not be read.',
  '今回確認した候補には、十分に近い地形や構図の写真がありませんでした。条件を減らすか、別の写真や場所を試してください。':
    'None of the checked candidates had a photo with close enough terrain or composition. Use fewer conditions, or try another photo or place.',
  '比較する写真がありません。': 'There are no photos to compare.',
  '写真の説明を確認できませんでした。': 'The photo description could not be checked.',
  '今回の候補は Google Maps の情報に基づく検索結果です。写真の比較を行った結果ではありません。':
    'These results are based on Google Maps information, not on photo comparison.',
  ' 地図の検索で候補を確認できなかったため、既存の紹介用データを表示しています。':
    ' No results could be confirmed through map search, so the demonstration data is shown.',
  '確認済みの Commons 写真を選んでください。': 'Choose a verified Commons photo.',
  '国・地域の主な言語と通貨です。地域によって異なる場合があります。':
    'Main languages and currency of the country or region. They can differ by area.',
  言語: 'Language',
  通貨: 'Currency',
};
