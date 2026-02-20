module.exports = {
    // 一般
    bot_name: "Giveaway Bot",
    developer: "Developer",
    language_name: "日本語",
    language_code: "ja",

    // プレゼント抽選タイトル
    giveaway_title: "GIVEAWAY",
    giveaway_started: "抽選が始まりました！",
    giveaway_ended: "抽選が終了しました！",
    giveaway_ended_sad: "抽選終了",
    congratulations: "おめでとうございます！",

    // プレゼント抽選情報
    prize: "賞品",
    sponsor: "スポンサー",
    winner_count: "当選者数",
    participants: "参加者",
    ends_at: "終了",
    date: "日付",
    winners: "当選者",
    total_participants: "総参加者数",

    // 参加条件
    requirements: "参加条件",
    required_roles: "必要なロール",
    min_level: "最低レベル",
    min_invites: "最低招待数",
    min_messages: "最低メッセージ数",
    messages_required: "この抽選に参加するには{count}件のメッセージが必要です。",
    survey: "アンケート",
    survey_question: "質問",
    survey_answer: "回答",
    survey_join: "回答して参加",
    survey_placeholder: "ここに回答を入力...",
    survey_modal_title: "抽選アンケート",
    survey_completed: "アンケート完了！",
    account_age: "アカウント年齢",
    server_membership: "サーバー在籍期間",
    days: "日",

    // ボーナス
    bonus_entries: "ボーナスエントリー",
    entry: "エントリー",
    your_entries: "あなたのエントリー",

    // ボタン
    join_button: "🎉 参加",
    leave_button: "🚪 退出",
    info_button: "📊 情報",
    ended_button: "🎊 抽選終了",
    reroll_button: "🔄 再抽選",

    // メッセージ
    giveaway_joined: "抽選に参加しました！",
    joined_giveaway: "抽選に参加しました！",
    left_giveaway: "抽選から退出しました！",
    good_luck: "頑張ってね！",
    rejoin_info: "再参加するにはボタンをクリックしてください。",
    no_winner: "参加者が不足のため当選者を決定できませんでした！",
    already_joined: "既に参加済み",
    already_joined_desc: "この抽選には既に参加しています。「退出」をクリックして退出できます。",
    not_joined: "この抽選には参加していません！",

    // ステータス
    status: "ステータス",
    joined: "参加済み！",
    not_participated: "未参加",
    participation_status: "参加状況",

    // 成功/エラーメッセージ
    success: "成功",
    error: "エラー",
    permission_error: "権限エラー",
    manage_server_required: "このコマンドを使用するには`サーバーを管理`権限が必要です。",
    only_owner: "このコマンドはボットオーナーのみ使用できます。",
    giveaway_not_found: "抽選が見つかりません。",
    giveaway_or_ended: "抽選が見つからないか、既に終了しています。",
    giveaway_not_ended: "抽選はまだ終了していません。",
    no_reroll_participants: "再抽選する参加者がいません。",
    command_error: "コマンドの実行中にエラーが発生しました。",
    participation_blocked: "抽選への参加がブロックされています。",

    // Anti-Cheat
    anticheat_cooldown: "数秒お待ちいただいてから再度お試しください。",
    anticheat_suspicious: "あなたのアカウントはアンチチートシステムによって不審としてフラグが立てられました。この抽選には参加できません。",
    anticheat_spam: "繰り返しの参加/退出活動により、この抽選から一時的にブロックされました。",
    anticheat_win_limit: "今日の最大当選回数に達しました。明日もう一度お試しください！",

    // Top.gg投票システム
    vote_required_title: "🗳️ 投票が必要です！",
    vote_required_desc: "抽選を開始するには**Top.gg**でボットに投票してください！\n\n投票後に再試行してください。プレミアムユーザーは投票をスキップできます。",
    vote_button: "🗳️ 今すぐ投票",
    premium_button: "⭐ プレミアムを取得",
    vote_thanks: "投票ありがとうございます！",

    // バグ報告システム
    report_modal_title: "🐛 バグを報告",
    report_title_label: "簡単なタイトル",
    report_title_placeholder: "例：抽選が開始しない",
    report_desc_label: "詳細な説明",
    report_desc_placeholder: "バグを詳しく説明してください。何をしましたか？何が起こるべきでしたか？何が起こりましたか？",
    report_steps_label: "再現手順（オプション）",
    report_steps_placeholder: "1. /giveaway startと入力\n2. 期間を入力\n3. エラーが発生",
    report_sent_title: "🎉 おお、バグを見つけましたね！",
    report_sent_desc: "ナイスキャッチ、友達！あなた得意だね！🕵️\n\n報告ありがとう。開発チームがすぐに確認します。この調子で！💪",
    report_disabled: "バグ報告システムは現在無効です。",
    report_error: "報告の送信中にエラーが発生しました。",
    not_provided: "未入力",

    // 抽選開始
    giveaway_started_title: "抽選が開始されました！",
    duration: "期間",
    channel: "チャンネル",
    invalid_duration: "無効な期間",
    min_duration_error: "抽選期間は最低10秒必要です。",

    // 抽選アクション
    giveaway_ended_title: "抽選終了",
    giveaway_deleted: "抽選が削除されました",
    rerolled: "再抽選完了",
    new_winner: "新しい当選者",
    new_winners: "新しい当選者",
    join_failed: "参加失敗",
    leave_failed: "退出失敗",

    // リスト
    active_giveaways: "開催中の抽選",
    no_active_giveaways: "現在開催中の抽選はありません。",
    giveaway_history: "抽選履歴",
    empty_history: "抽選履歴がありません。",
    giveaway_stats: "抽選統計",
    page: "ページ",

    // 統計
    total_giveaways: "総抽選数",
    completed: "完了",
    ongoing: "進行中",
    total_participations: "総参加数",
    total_winners: "総当選者数",
    distributed_prizes: "配布済み賞品",
    most_popular: "最も人気の抽選",
    top_winner: "トップ当選者",
    no_data: "データがありません",
    times: "回",

    // ブラックリスト
    blacklist: "ブラックリスト",
    blacklist_title: "抽選ブラックリスト",
    added_to_blacklist: "ブラックリストに追加",
    removed_from_blacklist: "ブラックリストから削除",
    already_blacklisted: "このユーザーは既にブラックリストに登録されています。",
    not_blacklisted: "このユーザーはブラックリストに登録されていません。",
    empty_blacklist: "ブラックリストは空です。",
    reason: "理由",
    no_reason: "理由なし",
    not_specified: "指定なし",
    total: "合計",
    users: "ユーザー",

    // プレミアム
    premium: "プレミアム",
    premium_active: "プレミアム有効",
    premium_not_active: "非プレミアム",
    premium_added: "プレミアム追加",
    premium_success: "プレミアムが有効になりました",
    premium_removed: "プレミアム削除",
    premium_list: "プレミアムリスト",
    premium_servers: "プレミアムサーバー",
    premium_users: "プレミアムユーザー",
    type: "種類",
    server: "サーバー",
    user: "ユーザー",
    target: "対象",
    name: "名前",
    added_by: "追加者",
    added_at: "追加日時",
    added_time: "追加時間",
    new_expiry: "新しい有効期限",
    premium_status: "プレミアムステータス",
    premium_extended: "プレミアム延長",
    lifetime: "永久",
    already_lifetime: "このプレミアムは既に永久です！延長不要です。",
    premium_not_found: "このIDのプレミアムが見つかりません。",
    premium_not_found_desc: "このサーバーまたはユーザーのプレミアムが見つかりません。",
    only_active_shown: "有効なプレミアムのみ表示",
    none: "なし",
    showing_active_only: "有効なプレミアムのみ表示中",

    // プレミアム情報コマンド
    premium_features_title: "プレミアム機能",
    premium_features: "プレミアム機能",
    why_premium: "なぜプレミアム？",
    premium_description: "プレミアムで抽選体験を最高のものに！無制限の機能と特典があなたを待っています。",
    free_plan: "無料プラン",
    premium_plan: "プレミアムプラン",
    active_giveaways: "開催中の抽選",
    max_duration: "最大期間",
    basic_features: "抽選開始/終了\n➡️ 再抽選\n➡️ 抽選編集\n➡️ リスト",
    pricing_title: "価格",
    discount_info: "先着100名様に特別割引！",
    how_to_buy_title: "購入方法",
    how_to_buy_content: "以下の方法でプレミアム機能を購入できます：",
    server_is_premium: "このサーバーはプレミアムです！",
    server_is_not_premium: "このサーバーはプレミアムではありません",

    // 時間単位（価格）
    week: "週",
    month: "月",
    months: "ヶ月",
    year: "年",

    // プレミアム機能リスト
    premium_features_list: "プレミアム機能",
    feature_code_giveaway: "コード抽選（ファイルアップロード）",
    feature_drop: "ドロップ抽選",
    feature_templates: "抽選テンプレート",
    feature_pause_resume: "一時停止/再開",
    feature_scheduled_giveaways: "予約抽選",
    feature_requirements: "高度な条件（ロール、年齢など）",
    feature_dm: "当選者へのDM",
    feature_stats: "高度な統計",
    feature_support: "優先サポート",
    feature_colors: "カスタム埋め込みカラー",
    feature_welcome: "ウェルカムメッセージカスタマイズ",
    feature_fast_mode: "高速抽選モード",

    // 制限
    max_giveaways: "最大抽選数",
    max_winners: "最大当選者数",
    contact_owner: "プレミアムを取得するにはボットオーナーに連絡してください！",
    buy_premium_info: "プレミアムを購入してすべての機能をアンロック！",
    buy_premium_footer: "より多くの機能のためにプレミアムを取得！",
    premium_active_footer: "プレミアム特典をお楽しみください！",
    premium_duration_error: "プレミアムなしでは最大7日間の抽選のみ開始できます。より長い抽選にはプレミアムが必要です！",
    premium_winner_limit_error: "プレミアムなしでは最大10人の当選者のみ選択できます。より多くの当選者にはプレミアムが必要です！",
    premium_count_limit_error: "プレミアムなしでは同時に最大5つの抽選のみ開催できます。より多くの抽選にはプレミアムが必要です！",

    // ヘルプ
    help_title: "Giveaway Botコマンド",
    giveaway_commands: "抽選コマンド",
    blacklist_commands: "ブラックリストコマンド",
    premium_commands: "プレミアムコマンド",
    other_commands: "その他のコマンド",
    owner_only: "ボットオーナー",

    // Ping
    pong: "Pong!",
    api_latency: "APIレイテンシ",
    bot_latency: "ボットレイテンシ",
    message_latency: "メッセージレイテンシ",
    ping_calculating: "計算中...",
    uptime: "稼働時間",
    minutes: "分",

    // 招待
    invite_bot: "ボットを招待",
    invite_desc: "下のリンクをクリックしてボットをサーバーに追加！",
    invite_link: "招待リンク",
    required_permissions: "必要な権限",

    // ボット情報
    bot_info: "ボット情報",
    server_count: "サーバー数",
    user_count: "ユーザー数",
    active_giveaway_count: "開催中の抽選",
    version: "バージョン",
    premium_server: "プレミアムサーバー",
    active: "有効",
    not_active: "無効",
    most_advanced_bot: "最も高度な抽選ボット！",
    ram_usage: "RAM使用量",
    links: "リンク",
    support_server: "サポートサーバー",
    website: "ウェブサイト",
    os: "オペレーティングシステム",

    // 言語
    language: "言語",
    language_changed: "言語が変更されました",
    language_set: "サーバーの言語が変更されました",
    select_language: "言語を選択",

    // DMメッセージ
    dm_winner_title: "おめでとうございます！抽選に当選しました！",
    dm_prize: "賞品",
    dm_server: "サーバー",
    dm_channel: "チャンネル",
    dm_claim: "賞品を受け取るにはサーバー管理者に連絡してください！",

    // フッター
    footer_join: "下のボタンをクリックして参加！",
    giveaway_id: "抽選ID",

    // 時間
    time_day: "日",
    time_days: "日",
    time_hour: "時間",
    time_hours: "時間",
    time_minute: "分",
    time_minutes: "分",
    time_second: "秒",
    time_seconds: "秒",

    // ドロップ
    drop: "ドロップ",
    drop_title: "🎁 ドロップ！",
    drop_desc: "最初にボタンをクリックした人が勝ち！",
    drop_winner: "ドロップ当選者",
    claim_button: "🏃‍♂️ 獲得！",
    drop_claimed: "ドロップ獲得済み",
    drop_claimed_by: "ドロップ獲得者：",

    // 一時停止/再開
    pause_giveaway: "抽選を一時停止",
    resume_giveaway: "抽選を再開",
    giveaway_paused: "抽選が一時停止されました",
    giveaway_resumed: "抽選が再開されました",
    pause_success: "抽選を一時停止しました。",
    resume_success: "抽選を再開しました。",
    already_paused: "この抽選は既に一時停止中です。",
    not_paused: "この抽選は一時停止されていません。",
    paused_footer: "⚠️ 一時停止中",

    // Privacy & ToS Short Keys
    privacy_policy_title: "プライバシーポリシー",
    tos_title: "利用規約",
    policy_last_updated: "最終更新: {date}",
    privacy_desc: "私たちはあなたのプライバシーを尊重します。詳細は下のボタンをクリックしてください。",
    tos_desc: "ボットを使用することで、以下の条件に同意したものとみなされます。",
    read_full_policy: "ポリシー全文を読む",
    read_full_tos: "利用規約を読む",
    privacy_summary: "**1. データ収集:** ユーザーID、サーバーID、抽選データ。\n**2. 使用:** 抽選管理、悪用防止。\n**3. 共有:** データは第三者と共有されません。\n**4. 削除:** データ削除をリクエストできます。",
    tos_summary: "**1. ルール:** DiscordのTOSとガイドラインに従ってください。\n**2. 禁止事項:** スパムやAPIの悪用は禁止です。\n**3. 責任:** サーバー所有者は賞品の配送に責任を負います。\n**4. 変更:** 規約は予告なく更新される場合があります。",
    privacy_button: "プライバシーポリシー",
    tos_button: "利用規約",
    support_server_button: "サポートサーバー",

    privacy_text: `# Giveaway+ Privacy Policy

Last Updated: 24.01.2026

As Giveaway+ ("Bot"), we value your privacy and data security. This policy explains what data is collected, how it is used, and stored when using our bot.

## 1. Collected Data
To provide our services, we collect and store the following information:

* **User IDs:** To determine giveaway winners, verify participants, check blacklist status, and manage premium memberships.
* **Guild IDs:** To save server-specific settings (language, log channels, etc.) and premium status.
* **Channel IDs:** To track where giveaway messages are sent.
* **Giveaway Data:** Giveaway details such as prize names, durations, winners, and participant counts (for \`history\` command).
* **Templates:** Custom giveaway templates created by users or servers.

## 2. Purpose of Data Use
Collected data is used solely for the following purposes:

* Starting, managing, and concluding giveaways.
* Preventing malicious users via the "Blacklist" system.
* Listing past giveaways with the \`history\` command.
* Remembering server-specific language (\`/language\`) settings.
* Activating and tracking Premium features.

## 3. Data Sharing
Collected data is **strictly** NOT shared or sold to third-party companies, advertisers, or other organizations. Data is used solely for the functionality of the bot.

## 4. Data Retention Period
* **Active Giveaways:** Data is processed in real-time during the giveaway period.
* **Past Data:** Giveaway history (\`history\`) and server settings are stored as long as the bot is in the server or until the user requests deletion.

## 5. User Rights and Data Deletion
Users have the right to request the deletion of their data. If you wish to have your data completely removed from our system, please contact us via our Support Server.

## 6. Changes
We may update this privacy policy from time to time. When significant changes are made, notifications will be made via the bot's support server or announcement channels.

---
**Contact:** [Support Server](https://discord.gg/qaNsZcBw8d)`,

    tos_text: `# Giveaway+ Terms of Service (ToS)

Last Updated: 24.01.2026

Please read these Terms of Service carefully before using the Giveaway+ ("Bot") service. By adding the bot to your server or using its commands, you agree to these terms.

## 1. General Use
Giveaway+ is a tool designed to manage giveaway events on Discord servers. Users agree to use the bot only for its intended purpose.

* Users must comply with Discord's own [Terms of Service](https://discord.com/terms) and [Community Guidelines](https://discord.com/guidelines).
* Exploiting any vulnerability, bug, or security flaw of the bot is prohibited.

## 2. Restrictions and Bans (Blacklist)
In the following cases, bot management reserves the right to add the user or server to the **"Blacklist"**, blocking bot usage temporarily or permanently:

* Spamming the bot or intentionally stressing API limits.
* Organizing fake giveaways to scam or mislead other users.
* Attempting to copy the bot's source code or perform reverse engineering.

## 3. Premium Services and Refund Policy
Giveaway+ may offer "Premium" membership for access to certain features.

* **Digital Content:** Premium membership is a digital service. Once the purchase is completed, **no refunds** are made unless there is a technical defect originating from the service.
* **Transfer:** Premium memberships are not transferable to another account (except at management's initiative).
* **Pricing:** Management reserves the right to change premium prices and features with prior notice.

## 4. Disclaimer
Giveaway+ is just a tool.

* **Prize Delivery:** Bot management is **not responsible** for the delivery of prizes promised by server owners. The reliability of giveaways is entirely the responsibility of the organizing server.
* **Data Loss:** Bot management cannot be held responsible for data loss due to potential technical failures, Discord API outages, or database issues.
* **Interruptions:** 100% uptime is not guaranteed; interruptions may occur during maintenance work.

## 5. Changes to Terms
The bot developer reserves the right to update these Terms of Service at any time. Users agree to the updated terms by continuing to use the bot.

---
**Contact and Support:**
For any questions or notifications, you can join our Support Server:
[Support Server](https://discord.gg/qaNsZcBw8d)`,

    // メンション
    mention_response: "やあ {user}！👋 私は**{bot}**、あなたのサーバーでプロフェッショナルでモダンな抽選を開催するために設計されました。🎉\n\n`/help`と入力して始めましょう。素晴らしい賞品を配りましょう！🚀",

    // Appeal
    appeal_modal_title: "Appeal Decision",
    appeal_subject_label: "Subject",
    appeal_subject_placeholder: "User Ban / Server Ban",
    appeal_defense_label: "Defense",
    appeal_defense_placeholder: "Why should the ban be lifted?",
    appeal_sent_title: "Appeal Sent",
    appeal_sent_desc: "Your appeal has been sent to the support team. It will be reviewed shortly.",
    appeal_disabled: "Appeal system is currently disabled or not configured.",

    // Update Command
    update_description: "GitHubからボットを更新します（所有者のみ）",
    update_owner_only: "❌ このコマンドを使用する権限がありません！",
    update_title: "📢 更新ステータス",
    update_error: "❌ **エラーが発生しました：**",
    update_already_up_to_date: "✅ **ボットはすでに最新です！**\n更新は見つかりませんでした。",
    update_success: "🚀 **更新成功！**\n\n**変更点：**\n```bash\n{output}\n```\n\n🔄 **ボットを再起動しています...**",

};
