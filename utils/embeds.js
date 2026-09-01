'use strict';

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { BRAND } = require('./constants');

function base(title, description, banner = BRAND.banner) {
  return new EmbedBuilder()
    .setColor(BRAND.color)
    .setTitle(title)
    .setDescription(description)
    .setImage(banner)
    .setFooter({ text: 'Alcatraz Skygen • Minecraft Bedrock' });
}

function sectionBox(lines) {
  return `\`\`\`\n${lines.join('\n')}\n\`\`\``;
}

function infoPanels(config) {
  const discordRules = base(
    '👑 Alcatraz Skygen — Rules',
    [
      '> Keep the community fair, safe and enjoyable. Staff may take action against behaviour that harms the server even if it is not specifically listed.',
      '',
      '💬 **DISCORD RULES**',
      sectionBox([
        '01 • Respect everyone — no harassment, bullying, threats or targeted abuse.',
        '02 • No racism, slurs, hate speech or discriminatory language.',
        '03 • No doxing, threats to dox, or sharing private information.',
        '04 • No NSFW, sexual or extremely inappropriate content.',
        '05 • No message, emoji, reaction, link or ping spam.',
        '06 • Avoid unnecessary drama, arguments and deliberate disruption.',
        '07 • Raiding or attempting to raid the server is prohibited.',
        '08 • Alt accounts require staff permission.',
        '09 • Follow reasonable staff instructions during moderation cases.'
      ]),
      '',
      '⚔️ **DISCORD STRIKES**',
      sectionBox([
        '1st Strike  → 12-Hour Timeout',
        '2nd Strike  → 3-Day Timeout',
        '3rd Strike  → Permanent Ban'
      ]),
      '',
      '> 🚨 Serious offences can skip the strike system entirely.'
    ].join('\n')
  );

  const realmRules = new EmbedBuilder()
    .setColor(BRAND.color)
    .setTitle('⛏️ Alcatraz Skygen — Realm Rules')
    .setDescription([
      '⛓️ **FAIR PLAY**',
      sectionBox([
        '01 • No hacked clients, cheats, autoclickers, macros or unfair mods.',
        '02 • Maximum CPS is 25.',
        '03 • No unfair skins or texture packs designed to give an advantage.',
        '04 • No lag switches, packet manipulation or network abuse.',
        '05 • No combat logging, spawn killing or repeated underkilling.'
      ]),
      '',
      '💰 **ECONOMY & EXPLOITS**',
      sectionBox([
        '06 • Do not exploit bugs, glitches or unintended mechanics.',
        '07 • No duplication of items, money, keys, generators, crates or rewards.',
        '08 • Do not abuse shops, sell systems or unintended money methods.',
        '09 • Do not abuse homes or teleports to access restricted areas.',
        '10 • Scamming through trades or deals is prohibited.'
      ]),
      '',
      '🚨 **SERVER SAFETY**',
      sectionBox([
        '11 • Ban or punishment evasion is forbidden.',
        '12 • Offensive or misleading usernames are prohibited.',
        '13 • Excessive toxicity and deliberate provocation are not allowed.',
        '14 • Intentionally crashing or seriously disrupting the Realm is forbidden.'
      ])
    ].join('\n'))
    .setFooter({ text: 'Alcatraz Skygen • Play fair. Grind hard.' });

  const punishments = new EmbedBuilder()
    .setColor(BRAND.color)
    .setTitle('🔨 Punishments & Staff Discretion')
    .setDescription([
      '⚔️ **MINECRAFT PUNISHMENTS**',
      sectionBox([
        '1st Offence       → Warning',
        '2nd Offence       → Money / Bank Reset',
        '3rd Offence       → Temporary Ban',
        'Repeated Offences → Extended / Permanent Ban'
      ]),
      '',
      '> Hacking, major exploits, duplication, crashing, ban evasion and serious economy abuse may result in an **immediate permanent ban**.',
      '',
      '📌 **STAFF DISCRETION**',
      'Staff may increase or reduce punishments depending on the **severity, intent, history and impact** of an offence.',
      '',
      '> If you are unsure whether something is allowed, ask staff before doing it.'
    ].join('\n'))
    .setFooter({ text: '⛓️ Play fair. Have fun. Welcome to Alcatraz.' });

  return {
    rules: {
      embeds: [discordRules, realmRules, punishments],
      components: [new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('rules_accept').setLabel('I Understand').setEmoji('✅').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('open_support').setLabel('Ask Staff').setEmoji('🛟').setStyle(ButtonStyle.Secondary)
      )]
    },

    announcements: {
      embeds: [base('📢 Alcatraz Announcements', [
        '> Official news, resets, events, maintenance and major Realm updates will be posted here.',
        '',
        '📌 **WHAT YOU WILL FIND HERE**',
        sectionBox([
          '• Realm announcements',
          '• Major updates & resets',
          '• Maintenance notices',
          '• Events & competitions',
          '• Important community news'
        ]),
        '',
        '🔔 Enable notifications if you do not want to miss anything important.'
      ].join('\n'))]
    },

    howtoplay: {
      embeds: [base('🧱 How Alcatraz Skygen Works', [
        '> Start with almost nothing and grind your way to the top.',
        '',
        '⛏️ **YOUR PROGRESSION**',
        sectionBox([
          '1 • Generate resources',
          '2 • Sell what you earn',
          '3 • Upgrade your setup',
          '4 • Unlock better generators',
          '5 • Trade with other prisoners',
          '6 • Climb the ranks & leaderboards'
        ]),
        '',
        '💎 Build wealth, improve your island and become one of the richest prisoners in Alcatraz.'
      ].join('\n'))],
      components: [new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('show_realm_code').setLabel('Join The Realm').setEmoji('🎮').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('open_support').setLabel('Need Help').setEmoji('🛟').setStyle(ButtonStyle.Secondary)
      )]
    },

    serverinfo: {
      embeds: [base('🏝️ About Alcatraz Skygen', [
        '> A Minecraft Bedrock Skygen Realm built around progression, grinding, trading and competition.',
        '',
        '⛓️ **ALCATRAZ FEATURES**',
        sectionBox([
          '• Custom Skygen progression',
          '• Generators & upgrades',
          '• Player economy & trading',
          '• Ranks & rewards',
          '• Events & competitions',
          '• Custom Discord systems'
        ]),
        '',
        'The Realm is being rebuilt from the ground up with a custom addon and a dedicated Discord experience.'
      ].join('\n'))]
    },

    realmacccess: {
      embeds: [base('🎮 How To Join The Realm', [
        '> Ready to start your sentence? Joining **Alcatraz Skygen** only takes a minute.',
        '',
        '☁️ **JOINING STEPS**',
        sectionBox([
          '01 • Open Minecraft: Bedrock Edition',
          '02 • Select Play from the main menu',
          '03 • Open the Realms section',
          '04 • Select Add / Join Realm',
          '05 • Enter the Alcatraz Realm code',
          '06 • Press Join and wait for the Realm to load'
        ]),
        '',
        '🔑 **REALM CODE**',
        sectionBox([config.realmCode && config.realmCode !== 'SOON' ? 'Press the button below to reveal the current code privately.' : 'SOON']),
        '',
        '⛓️ **YOUR SENTENCE BEGINS**',
        'Generate resources, make money, upgrade your setup, trade with other prisoners and grind your way to the top.',
        '',
        '> 🛟 Having trouble joining? Open a support ticket and staff will help you.'
      ].join('\n'))],
      components: [new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('show_realm_code').setLabel('Show Realm Code').setEmoji('🔑').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('open_support').setLabel('Joining Help').setEmoji('🛟').setStyle(ButtonStyle.Secondary)
      )]
    },

    changelog: {
      embeds: [base('📝 Alcatraz Changelog', [
        '> Every important Realm, addon and Discord update will be logged here.',
        '',
        '✅ **UPDATE FORMAT**',
        sectionBox([
          '• Added — new content or features',
          '• Changed — balance or system changes',
          '• Fixed — bugs and problems resolved',
          '• Removed — retired content or systems'
        ]),
        '',
        'New changelogs will be posted whenever an update goes live.'
      ].join('\n'))]
    },

    ranks: {
      embeds: [base('⭐ Alcatraz Ranks', [
        '> Progress through Alcatraz and prove how far you can climb.',
        '',
        '🔒 **COMING SOON**',
        sectionBox([
          '• Rank names',
          '• Unlock requirements',
          '• Rank rewards',
          '• Progression perks'
        ]),
        '',
        'Rank details will be added once the in-game progression system is finalised.'
      ].join('\n'))]
    },

    rewards: {
      embeds: [base('🎁 Alcatraz Rewards', [
        '> Earn extra rewards by staying active and taking part in the Realm.',
        '',
        '💎 **REWARD SOURCES**',
        sectionBox([
          '• Events',
          '• Giveaways',
          '• Milestones',
          '• Realm progression',
          '• Limited-time drops'
        ]),
        '',
        'Watch this channel for claimable rewards and special drops.'
      ].join('\n'))]
    },

    events: {
      embeds: [base('🎯 Alcatraz Events', [
        '> Special competitions and community events will be announced here.',
        '',
        '🏆 **EVENTS MAY INCLUDE**',
        sectionBox([
          '• PvP tournaments',
          '• Build competitions',
          '• Grinding challenges',
          '• Treasure hunts',
          '• Limited-time Skygen events'
        ]),
        '',
        'Winners may receive in-game rewards, special roles or exclusive prizes.'
      ].join('\n'))]
    },

    realmstatus: {
      embeds: [base('📊 Alcatraz Realm Status', [
        '> Check this channel before reporting connection problems.',
        '',
        '🟢 **CURRENT STATUS**',
        sectionBox([
          'Realm       • Online / Managed by Staff',
          'Maintenance • None Announced',
          'Platform    • Minecraft Bedrock Edition'
        ]),
        '',
        'Maintenance and downtime notices will be posted here whenever needed.'
      ].join('\n'))]
    },

    support: {
      embeds: [base('🎫 Alcatraz Support', [
        '> Need help? Create a private ticket using one of the buttons below.',
        '',
        '🛟 **TICKET DEPARTMENTS**',
        sectionBox([
          'Support      • General questions & assistance',
          'Player Report• Report another player',
          'Bug Report   • Report a Realm or addon issue',
          'Ban Appeal   • Appeal a punishment',
          'Partnership  • Partnership enquiries'
        ]),
        '',
        'Please choose the correct department so staff can help you faster.'
      ].join('\n'))],
      components: [new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ticket_support').setLabel('Support').setEmoji('🛟').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('ticket_report').setLabel('Report Player').setEmoji('🚨').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('ticket_bug').setLabel('Bug Report').setEmoji('🐛').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('ticket_appeal').setLabel('Ban Appeal').setEmoji('🔨').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('ticket_partner').setLabel('Partnership').setEmoji('🤝').setStyle(ButtonStyle.Success)
      )]
    }
  };
}

module.exports = { base, infoPanels };
