'use strict';

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require('discord.js');
const { BRAND } = require('./constants');

function base(title, description, banner = BRAND.banner) {
  const embed = new EmbedBuilder()
    .setColor(BRAND.color)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: 'Alcatraz Skygen • Minecraft Bedrock' });

  if (banner) embed.setImage(banner);
  return embed;
}

function sectionBox(lines) {
  return `\`\`\`\n${lines.join('\n')}\n\`\`\``;
}

function infoPanels(config = {}) {
  const rulesEmbed = base('👑 Alcatraz Skygen — Rules', [
    '> Keep Alcatraz fair, competitive and enjoyable. Use common sense and follow staff instructions.',
    '',
    '💬 **DISCORD RULES**',
    sectionBox([
      '01 • Respect everyone — no harassment, threats, slurs or hate speech.',
      '02 • No doxing, NSFW content, spam, raids or deliberate disruption.',
      '03 • Alt accounts require staff permission.',
      '04 • Avoid unnecessary drama and targeted provocation.',
      '05 • Follow reasonable staff instructions during moderation cases.',
    ]),
    '',
    '⛏️ **REALM RULES**',
    sectionBox([
      '01 • No cheats, hacked clients, autoclickers, macros or unfair mods.',
      '02 • Maximum CPS: 25.',
      '03 • No exploiting, duplication or economy abuse.',
      '04 • No lag switches, packet abuse, combat logging or spawn killing.',
      '05 • No scamming, ban evasion or deliberate Realm disruption.',
    ]),
    '',
    '🔨 **PUNISHMENTS**',
    sectionBox([
      'Discord: 1st → 12h Timeout | 2nd → 3d Timeout | 3rd → Ban',
      'Realm: Warning → Bank Reset → Temp Ban → Permanent Ban',
    ]),
    '',
    '> 🚨 Severe offences such as hacking, duplication, crashing, doxing or raiding may result in an immediate ban.',
    '',
    '**Staff may adjust punishments based on severity, intent, history and impact.**',
  ].join('\n'));

  const rulesButtons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('rules_accept')
      .setLabel('I Understand')
      .setEmoji('✅')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('open_support')
      .setLabel('Ask Staff')
      .setEmoji('🛟')
      .setStyle(ButtonStyle.Secondary),
  );

  const ticketMenu = new StringSelectMenuBuilder()
    .setCustomId('ticket_type')
    .setPlaceholder('Choose a ticket type...')
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('General Support')
        .setDescription('Questions, help and general assistance')
        .setEmoji('🛟')
        .setValue('ticket_support'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Report a Player')
        .setDescription('Report another player privately')
        .setEmoji('🚨')
        .setValue('ticket_report'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Bug Report')
        .setDescription('Report a Realm, addon or bot issue')
        .setEmoji('🐛')
        .setValue('ticket_bug'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Ban Appeal')
        .setDescription('Appeal a punishment or ban')
        .setEmoji('🔨')
        .setValue('ticket_appeal'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Partnership')
        .setDescription('Partnership enquiries and requests')
        .setEmoji('🤝')
        .setValue('ticket_partner'),
    );

  return {
    rules: {
      embeds: [rulesEmbed],
      components: [rulesButtons],
    },

    announcements: {
      embeds: [base('📢 Alcatraz Announcements', [
        '> Official news, maintenance, resets, events and major Realm updates will be posted here.',
        '',
        '📌 **YOU WILL SEE**',
        sectionBox([
          '• Realm announcements',
          '• Major updates & resets',
          '• Maintenance notices',
          '• Events & competitions',
          '• Important community news',
        ]),
        '',
        '🔔 Turn on notifications if you do not want to miss important updates.',
      ].join('\n'))],
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
          '6 • Climb the ranks & leaderboards',
        ]),
        '',
        '💎 Build wealth, improve your island and become one of the richest prisoners in Alcatraz.',
      ].join('\n'))],
      components: [new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('show_realm_code')
          .setLabel('Join The Realm')
          .setEmoji('🎮')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('open_support')
          .setLabel('Need Help')
          .setEmoji('🛟')
          .setStyle(ButtonStyle.Secondary),
      )],
    },

    serverinfo: {
      embeds: [base('🏝️ About Alcatraz Skygen', [
        '> A Minecraft Bedrock Skygen Realm built around progression, grinding, trading and competition.',
        '',
        '⛓️ **FEATURES**',
        sectionBox([
          '• Custom Skygen progression',
          '• Generators & upgrades',
          '• Player economy & trading',
          '• Ranks & rewards',
          '• Events & competitions',
          '• Custom Discord systems',
        ]),
        '',
        'Alcatraz is being rebuilt from the ground up with a custom addon and dedicated Discord systems.',
      ].join('\n'))],
    },

    realmacccess: {
      embeds: [base('🎮 How To Join The Realm', [
        '> Ready to start your sentence? Joining **Alcatraz Skygen** only takes a minute.',
        '',
        '☁️ **JOINING STEPS**',
        sectionBox([
          '01 • Open Minecraft: Bedrock Edition',
          '02 • Select Play',
          '03 • Open the Realms section',
          '04 • Select Add / Join Realm',
          '05 • Enter the Realm code',
          '06 • Press Join and load in',
        ]),
        '',
        '🔑 **REALM CODE**',
        sectionBox([
          config.realmCode && config.realmCode !== 'SOON'
            ? 'Press the button below to reveal the current code privately.'
            : 'SOON',
        ]),
        '',
        '⛓️ Generate resources, earn money, upgrade your setup and grind your way to the top.',
        '',
        '> 🛟 Having trouble joining? Open a support ticket and staff will help you.',
      ].join('\n'))],
      components: [new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('show_realm_code')
          .setLabel('Show Realm Code')
          .setEmoji('🔑')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('open_support')
          .setLabel('Joining Help')
          .setEmoji('🛟')
          .setStyle(ButtonStyle.Secondary),
      )],
    },

    changelog: {
      embeds: [base('📝 Alcatraz Changelog', [
        '> Important Realm, addon and Discord changes will be posted here.',
        '',
        sectionBox([
          '✅ Added   — new features or content',
          '🔄 Changed — balance or system changes',
          '🛠️ Fixed   — bugs and issues resolved',
          '🗑️ Removed — retired content or systems',
        ]),
      ].join('\n'))],
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
          '• Progression perks',
        ]),
      ].join('\n'))],
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
          '• Limited-time drops',
        ]),
      ].join('\n'))],
    },

    events: {
      embeds: [base('🎯 Alcatraz Events', [
        '> Competitions and special community events will be announced here.',
        '',
        '🏆 **EVENT TYPES**',
        sectionBox([
          '• PvP tournaments',
          '• Build competitions',
          '• Grinding challenges',
          '• Treasure hunts',
          '• Limited-time Skygen events',
        ]),
      ].join('\n'))],
    },

    realmstatus: {
      embeds: [base('📊 Alcatraz Realm Status', [
        '> Check here before reporting connection problems.',
        '',
        '🟢 **CURRENT STATUS**',
        sectionBox([
          'Realm       • Online / Managed by Staff',
          'Maintenance • None Announced',
          'Platform    • Minecraft Bedrock Edition',
        ]),
        '',
        'Maintenance and downtime notices will be posted here when needed.',
      ].join('\n'))],
    },

    support: {
      embeds: [base('🎫 Alcatraz Support', [
        '> Need help? Choose the correct ticket type from the dropdown below.',
        '',
        '🛟 **TICKET TYPES**',
        sectionBox([
          'Support       • General questions & assistance',
          'Player Report • Report another player',
          'Bug Report    • Realm, addon or bot issues',
          'Ban Appeal    • Appeal a punishment',
          'Partnership   • Partnership enquiries',
        ]),
        '',
        'Please only open one ticket for the same issue.',
      ].join('\n'))],
      components: [new ActionRowBuilder().addComponents(ticketMenu)],
    },
  };
}

module.exports = { base, infoPanels };
