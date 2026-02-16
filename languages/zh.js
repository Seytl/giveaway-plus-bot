module.exports = {
    // 通用
    bot_name: "Giveaway Bot",
    developer: "Developer",
    language_name: "中文",
    language_code: "zh",

    // 抽奖标题
    giveaway_title: "GIVEAWAY",
    giveaway_started: "抽奖已开始！",
    giveaway_ended: "抽奖已结束！",
    giveaway_ended_sad: "抽奖结束",
    congratulations: "恭喜！",

    // 抽奖信息
    prize: "奖品",
    sponsor: "赞助商",
    winner_count: "中奖人数",
    participants: "参与者",
    ends_at: "结束时间",
    date: "日期",
    winners: "中奖者",
    total_participants: "总参与人数",

    // 参与条件
    requirements: "参与条件",
    required_roles: "所需身份组",
    min_level: "最低等级",
    min_invites: "最低邀请数",
    min_messages: "最低消息数",
    messages_required: "您需要{count}条消息才能参与此抽奖。",
    survey: "问卷",
    survey_question: "问题",
    survey_answer: "回答",
    survey_join: "回答并参与",
    survey_placeholder: "在此输入您的回答...",
    survey_modal_title: "抽奖问卷",
    survey_completed: "问卷已完成！",
    account_age: "账号年龄",
    server_membership: "服务器成员时长",
    days: "天",

    // 奖励
    bonus_entries: "额外机会",
    entry: "次机会",
    your_entries: "您的抽奖次数",

    // 按钮
    join_button: "🎉 参与",
    leave_button: "🚪 退出",
    info_button: "📊 信息",
    ended_button: "🎊 抽奖已结束",
    reroll_button: "🔄 重新抽取",

    // 消息
    giveaway_joined: "已参与抽奖！",
    joined_giveaway: "您已参与抽奖！",
    left_giveaway: "您已退出抽奖！",
    good_luck: "祝你好运！",
    rejoin_info: "点击按钮重新参与。",
    no_winner: "由于参与者不足，无法确定中奖者！",
    already_joined: "已经参与",
    already_joined_desc: "您已经参与了此抽奖。点击「退出」可以退出。",
    not_joined: "您还没有参与此抽奖！",

    // 状态
    status: "状态",
    joined: "已参与！",
    not_participated: "未参与",
    participation_status: "您的参与状态",

    // 成功/错误消息
    success: "成功",
    error: "错误",
    permission_error: "权限错误",
    manage_server_required: "您需要`管理服务器`权限才能使用此命令。",
    only_owner: "只有机器人所有者才能使用此命令。",
    giveaway_not_found: "未找到抽奖。",
    giveaway_or_ended: "未找到抽奖或抽奖已结束。",
    giveaway_not_ended: "抽奖尚未结束。",
    no_reroll_participants: "没有剩余参与者可以重新抽取。",
    command_error: "执行命令时发生错误。",
    participation_blocked: "您被禁止参与抽奖。",

    // Top.gg投票系统
    vote_required_title: "🗳️ 需要投票！",
    vote_required_desc: "您需要在**Top.gg**上为机器人投票才能开始抽奖！\n\n投票后请重试。高级用户可以跳过投票。",
    vote_button: "🗳️ 立即投票",
    premium_button: "⭐ 获取高级版",
    vote_thanks: "感谢您的投票！",

    // Bug报告系统
    report_modal_title: "🐛 报告Bug",
    report_title_label: "简短标题",
    report_title_placeholder: "例如：抽奖无法开始",
    report_desc_label: "详细描述",
    report_desc_placeholder: "详细描述这个bug。您做了什么？应该发生什么？实际发生了什么？",
    report_steps_label: "重现步骤（可选）",
    report_steps_placeholder: "1. 输入 /giveaway start\n2. 输入时长\n3. 出现错误",
    report_sent_title: "🎉 哇，你发现了一个bug！",
    report_sent_desc: "抓得好，朋友！你很擅长这个！🕵️\n\n感谢告诉我们。我们的开发团队会尽快处理。继续加油！💪",
    report_disabled: "Bug报告系统目前已禁用。",
    report_error: "发送报告时发生错误。",
    not_provided: "未提供",

    // 抽奖开始
    giveaway_started_title: "抽奖已开始！",
    duration: "时长",
    channel: "频道",
    invalid_duration: "无效时长",
    min_duration_error: "抽奖时长至少需要10秒。",

    // 抽奖操作
    giveaway_ended_title: "抽奖已结束",
    giveaway_deleted: "抽奖已删除",
    rerolled: "已重新抽取",
    new_winner: "新中奖者",
    new_winners: "新中奖者",
    join_failed: "参与失败",
    leave_failed: "退出失败",

    // 列表
    active_giveaways: "进行中的抽奖",
    no_active_giveaways: "目前没有进行中的抽奖。",
    giveaway_history: "抽奖历史",
    empty_history: "抽奖历史为空。",
    giveaway_stats: "抽奖统计",
    page: "页",

    // 统计
    total_giveaways: "总抽奖数",
    completed: "已完成",
    ongoing: "进行中",
    total_participations: "总参与次数",
    total_winners: "总中奖人数",
    distributed_prizes: "已发放奖品",
    most_popular: "最受欢迎的抽奖",
    top_winner: "最佳中奖者",
    no_data: "暂无数据",
    times: "次",

    // 黑名单
    blacklist: "黑名单",
    blacklist_title: "抽奖黑名单",
    added_to_blacklist: "已添加到黑名单",
    removed_from_blacklist: "已从黑名单移除",
    already_blacklisted: "此用户已在黑名单中。",
    not_blacklisted: "此用户不在黑名单中。",
    empty_blacklist: "黑名单为空。",
    reason: "原因",
    no_reason: "无原因",
    not_specified: "未指定",
    total: "总计",
    users: "用户",

    // 高级版
    premium: "高级版",
    premium_active: "高级版已激活",
    premium_not_active: "非高级版",
    premium_added: "已添加高级版",
    premium_success: "高级版已成功激活",
    premium_removed: "高级版已移除",
    premium_list: "高级版列表",
    premium_servers: "高级服务器",
    premium_users: "高级用户",
    type: "类型",
    server: "服务器",
    user: "用户",
    target: "目标",
    name: "名称",
    added_by: "添加者",
    added_at: "添加时间",
    added_time: "添加时间",
    new_expiry: "新到期时间",
    premium_status: "高级版状态",
    premium_extended: "高级版已延长",
    lifetime: "永久",
    already_lifetime: "此高级版已是永久的！无需延长。",
    premium_not_found: "未找到此ID的高级版。",
    premium_not_found_desc: "未找到此服务器或用户的高级版。",
    only_active_shown: "仅显示有效的高级版",
    none: "无",
    showing_active_only: "仅显示有效的高级版",

    // 高级版信息命令
    premium_features_title: "高级版功能",
    premium_features: "高级版功能",
    why_premium: "为什么选择高级版？",
    premium_description: "通过高级版将您的抽奖体验提升到顶峰！无限功能和特权等着您。",
    free_plan: "免费版",
    premium_plan: "高级版",
    active_giveaways: "进行中的抽奖",
    max_duration: "最长时长",
    basic_features: "开始/结束抽奖\n➡️ 重新抽取\n➡️ 编辑抽奖\n➡️ 列表",
    pricing_title: "价格",
    discount_info: "前100名客户享受特别折扣！",
    how_to_buy_title: "如何购买？",
    how_to_buy_content: "您可以使用以下方式购买高级版功能：",
    server_is_premium: "此服务器是高级版！",
    server_is_not_premium: "此服务器不是高级版",

    // 时间单位（价格）
    week: "周",
    month: "月",
    months: "个月",
    year: "年",

    // 高级版功能列表
    premium_features_list: "高级版功能",
    feature_code_giveaway: "代码抽奖（文件上传）",
    feature_drop: "Drop抽奖",
    feature_templates: "抽奖模板",
    feature_pause_resume: "暂停/恢复",
    feature_scheduled_giveaways: "定时抽奖",
    feature_requirements: "高级条件（身份组、年龄等）",
    feature_dm: "私信中奖者",
    feature_stats: "高级统计",
    feature_support: "优先支持",
    feature_colors: "自定义嵌入颜色",
    feature_welcome: "欢迎消息自定义",
    feature_fast_mode: "快速抽奖模式",

    // 限制
    max_giveaways: "最大抽奖数",
    max_winners: "最大中奖人数",
    contact_owner: "联系机器人所有者获取高级版！",
    buy_premium_info: "购买高级版解锁所有功能！",
    buy_premium_footer: "获取高级版以获得更多功能！",
    premium_active_footer: "享受您的高级版特权！",
    premium_duration_error: "没有高级版，您只能开始最长7天的抽奖。更长时间的抽奖需要高级版！",
    premium_winner_limit_error: "没有高级版，您只能选择最多10名中奖者。更多中奖者需要高级版！",
    premium_count_limit_error: "没有高级版，您同时只能有最多5个活跃抽奖。更多抽奖需要高级版！",

    // 帮助
    help_title: "Giveaway Bot 命令",
    giveaway_commands: "抽奖命令",
    blacklist_commands: "黑名单命令",
    premium_commands: "高级版命令",
    other_commands: "其他命令",
    owner_only: "机器人所有者",

    // Ping
    pong: "Pong!",
    api_latency: "API延迟",
    bot_latency: "机器人延迟",
    message_latency: "消息延迟",
    ping_calculating: "计算中...",
    uptime: "运行时间",
    minutes: "分钟",

    // 邀请
    invite_bot: "邀请机器人",
    invite_desc: "点击下方链接将机器人添加到您的服务器！",
    invite_link: "邀请链接",
    required_permissions: "所需权限",

    // 机器人信息
    bot_info: "机器人信息",
    server_count: "服务器数量",
    user_count: "用户数量",
    active_giveaway_count: "进行中的抽奖",
    version: "版本",
    premium_server: "高级服务器",
    active: "已激活",
    not_active: "未激活",
    most_advanced_bot: "最先进的抽奖机器人！",
    ram_usage: "内存使用",
    links: "链接",
    support_server: "支持服务器",
    website: "网站",
    os: "操作系统",

    // 语言
    language: "语言",
    language_changed: "语言已更改",
    language_set: "服务器语言已更改",
    select_language: "选择语言",

    // 私信消息
    dm_winner_title: "恭喜！您中奖了！",
    dm_prize: "奖品",
    dm_server: "服务器",
    dm_channel: "频道",
    dm_claim: "联系服务器管理员领取您的奖品！",

    // 页脚
    footer_join: "点击下方按钮参与！",
    giveaway_id: "抽奖ID",

    // 时间
    time_day: "天",
    time_days: "天",
    time_hour: "小时",
    time_hours: "小时",
    time_minute: "分钟",
    time_minutes: "分钟",
    time_second: "秒",
    time_seconds: "秒",

    // Drop
    drop: "Drop",
    drop_title: "🎁 DROP！",
    drop_desc: "第一个点击按钮的人获胜！",
    drop_winner: "Drop中奖者",
    claim_button: "🏃‍♂️ 领取！",
    drop_claimed: "Drop已被领取",
    drop_claimed_by: "Drop被领取者：",

    // 暂停/恢复
    pause_giveaway: "暂停抽奖",
    resume_giveaway: "恢复抽奖",
    giveaway_paused: "抽奖已暂停",
    giveaway_resumed: "抽奖已恢复",
    pause_success: "抽奖已成功暂停。",
    resume_success: "抽奖已成功恢复。",
    already_paused: "此抽奖已经暂停。",
    not_paused: "此抽奖没有暂停。",
    paused_footer: "⚠️ 已暂停",

    // 提及
    mention_response: "嘿 {user}！👋 我是**{bot}**，专为在您的服务器中举办专业现代的抽奖活动而设计。🎉\n\n输入`/help`开始使用。让我们分发一些精彩的奖品吧！🚀",

    // Appeal
    appeal_modal_title: "Appeal Decision",
    appeal_subject_label: "Subject",
    appeal_subject_placeholder: "User Ban / Server Ban",
    appeal_defense_label: "Defense",
    appeal_defense_placeholder: "Why should the ban be lifted?",
    appeal_sent_title: "Appeal Sent",
    appeal_sent_desc: "Your appeal has been sent to the support team. It will be reviewed shortly.",
    appeal_disabled: "Appeal system is currently disabled or not configured.",

    // Privacy & ToS
    privacy_policy_title: "隐私政策",
    tos_title: "服务条款",
    policy_last_updated: "最后更新: {date}",
    privacy_desc: "我们重视您的数据隐私。点击下方按钮查看详情。",
    tos_desc: "使用机器人即表示您同意以下条款。",
    read_full_policy: "阅读完整政策",
    read_full_tos: "阅读服务条款",
    privacy_summary: "**1. 数据收集：** 用户ID、服务器ID、抽奖数据。\n**2. 用途：** 管理抽奖，防止滥用。\n**3. 共享：** 您的数据绝不会与第三方共享。\n**4. 删除：** 您可以请求删除数据。",
    tos_summary: "**1. 规则：** 遵守Discord服务条款和准则。\n**2. 禁止：** 禁止刷屏或滥用API。\n**3. 责任：** 服务器所有者负责奖品发放。\n**4. 变更：** 条款可能会在不通知的情况下更新。",
    privacy_button: "隐私政策",
    tos_button: "服务条款",
    support_server_button: "支持服务器",

    privacy_text: `# Giveaway+ Privacy Policy

Last Updated: 24.01.2026

As Giveaway+ ("Bot"), we value your privacy and data security. This policy explains what data is collected, how it is used, and stored when using our bot.

## 1. Collected Data
To provide our services, we collect and store the following information:

* **User IDs:** To determine giveaway winners, verify participants, check blacklist status, and manage premium memberships.
* **Guild IDs:** To save server-specific settings (language, log channels, etc.) and premium status.
* **Channel IDs:** To track where giveaway messages are sent.
* **Giveaway Data:** Giveaway details such as prize names, durations, winners, and participant counts (for \\\`history\\\` command).
* **Templates:** Custom giveaway templates created by users or servers.

## 2. Purpose of Data Use
Collected data is used solely for the following purposes:

* Starting, managing, and concluding giveaways.
* Preventing malicious users via the "Blacklist" system.
* Listing past giveaways with the \\\`history\\\` command.
* Remembering server-specific language (\\\`/language\\\`) settings.
* Activating and tracking Premium features.

## 3. Data Sharing
Collected data is **strictly** NOT shared or sold to third-party companies, advertisers, or other organizations. Data is used solely for the functionality of the bot.

## 4. Data Retention Period
* **Active Giveaways:** Data is processed in real-time during the giveaway period.
* **Past Data:** Giveaway history (\\\`history\\\`) and server settings are stored as long as the bot is in the server or until the user requests deletion.

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
    // Update Command
    update_description: "从 GitHub 更新机器人（仅限所有者）",
    update_owner_only: "❌ 您没有权限使用此命令！",
    update_title: "📢 更新状态",
    update_error: "❌ **发生错误：**",
    update_already_up_to_date: "✅ **机器人已是最新版本！**\n未发现更新。",
    update_success: "🚀 **更新成功！**\n\n**变更：**\n```bash\n{output}\n```\n\n🔄 **正在重启机器人...**",

};
