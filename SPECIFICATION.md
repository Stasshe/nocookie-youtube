next,npm構成のstatic site hosting（ここ重要）のサイトです。


nocookie-youtubeを視聴し、その閲覧時間を管理者が管理する用のサイトです。

初回（クッキーまたはローカルストレージ）なら、名前を入力しないと使えないようにしてください。


管理者は、その名前のところに"Admin_Manager"（.envで管理）と入力すると管理者として入れます。


ユーザーが、見たいyoutubeのリンクを中央の入力ウィンドウに貼り付けると、即時でページの最前面最大のiframeでnocookieが表示されます。


それぞれのユーザーの試聴時間を計測します。30秒ごとにユーザーそれぞれのキーでfirebase realtime databaseに書き込みます。
firebase.rulesは、全てのユーザーに全てをallowです。


画面上部には、ブラウザのような形で、タブとアドレスバーを用意して。
タブは増やせるし、タブを切り替えると、そのタブで見ているno-cookie-youtubeが見れます。

MPAで、管理者ダッシュボードページと、ホームのページ（アドレスバーなどを表示の上、タブ内の初期表示内に、使い方説明を記述。）の2つがあります。

ユーザーネーム入力はモーダルです。