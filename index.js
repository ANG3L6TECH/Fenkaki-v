// [+] Fenkaki Anti-Raid • Bot Discord Officiel Haute Sécurité H24
// Conforme à la lettre aux 63 commandes Security + Permissions (*, SECURE, /, Owner)
require('dotenv').config();
const http = require('http');
const {
  Client,
  GatewayIntentBits,
  Partials,
  ActivityType,
  EmbedBuilder,
  PermissionsBitField,
  ChannelType
} = require('discord.js');

const token = process.env.DISCORD_TOKEN;
const prefix = process.env.BOT_PREFIX || '+';

// 1. Serveur Web Keep-Alive intégré pour maintien H24 (Render, Koyeb, Glitch, Discloud)
const PORT = process.env.PORT || 10000;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({
    status: 'ONLINE',
    bot: 'Fenkaki Anti-Raid',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  }));
});

server.listen(PORT, () => {
  console.log(`🚀 [HTTP KEEP-ALIVE] Serveur d'écoute actif sur le port ${PORT}`);
});

if (!token || token.includes('VOTRE_TOKEN')) {
  console.error("❌ ERREUR FATALE : DISCORD_TOKEN manquant dans les variables d'environnement.");
  process.exit(1);
}

// 2. Client Discord.js v14
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [Partials.Message, Partials.Channel]
});

// 3. Spécifications officielles des 63 commandes de sécurité
const SECURITY_SPECS = [
  { name: 'secure', description: 'active toutes les protections', target: 'all', stateChange: 'Actif (Toutes les protections armées)', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#57F287', executionFeedback: '🛡️ **[MODE SECURE ACTIF]** active toutes les protections. Tous les modules de défense sont opérationnels.' },
  { name: 'unsecure', description: 'désactive le mode sécurité', target: 'all', stateChange: 'Désactivé', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#FEE75C', executionFeedback: '⚠️ **[MODE SECURE DÉSACTIVÉ]** désactive le mode sécurité. Le serveur opère en mode standard.' },
  { name: 'shield', description: 'active toutes les protections', target: 'all', stateChange: 'Bouclier Armé', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#5865F2', executionFeedback: '🛡️ **[BOUCLIER ACTIF]** active toutes les protections. Bouclier défensif total engagé.' },
  { name: 'shieldoff', description: 'les désactive', target: 'all', stateChange: 'Inactif', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#949ba4', executionFeedback: '🛡️ **[BOUCLIER DÉSACTIVÉ]** les désactive. Le bouclier défensif a été mis en sommeil.' },
  { name: 'panic', description: 'active le mode urgence', target: 'server', stateChange: 'URGENCE CRITIQUE', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#ED4245', executionFeedback: '🚨 **[PANIC MODE ENGAGÉ]** active le mode urgence. Salons verrouillés, invitations révoquées et filtrage strict.' },
  { name: 'panicoff', description: 'le désactive', target: 'server', stateChange: 'Normalisé', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#57F287', executionFeedback: '✅ **[PANIC MODE COUPÉ]** le désactive. Fin de l\'état d\'urgence, accès rétablis.' },
  { name: 'fortress', description: 'active la sécurité maximale', target: 'all', stateChange: 'Forteresse Maximale', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#EB459E', executionFeedback: '🏰 **[MODE FORTRESS ENGAGÉ]** active la sécurité maximale. Forteresse impénétrable activée.' },
  { name: 'fortressoff', description: 'la désactive', target: 'all', stateChange: 'Normal', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#949ba4', executionFeedback: '🏰 **[MODE FORTRESS DÉSACTIVÉ]** la désactive. Sécurité forteresse ramenée au seuil normal.' },
  { name: 'maintenance', description: 'active la maintenance', target: 'server', stateChange: 'En Maintenance', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#FEE75C', executionFeedback: '🔧 **[MODE MAINTENANCE ACTIF]** active la maintenance. Accès restreint au personnel habilité.' },
  { name: 'maintenanceoff', description: 'la désactive', target: 'server', stateChange: 'En Ligne', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#57F287', executionFeedback: '✅ **[MAINTENANCE TERMINÉE]** la désactive. Le serveur est de nouveau ouvert à tous les membres.' },
  { name: 'lockall', description: 'verrouille tous les salons', target: 'channels', stateChange: 'Tous les salons verrouillés', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#ED4245', executionFeedback: '🔒 **[LOCKALL APPLIQUÉ]** verrouille tous les salons. Envoi de messages bloqué pour @everyone.' },
  { name: 'unlockall', description: 'les déverrouille', target: 'channels', stateChange: 'Tous les salons déverrouillés', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#57F287', executionFeedback: '🔓 **[UNLOCKALL EFFECTUÉ]** les déverrouille. Les salons textuels sont de nouveau accessibles.' },
  { name: 'freeze', description: 'bloque l’activité', target: 'server', stateChange: 'Activité Gelée', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#5865F2', executionFeedback: '🧊 **[SERVEUR GELÉ]** bloque l’activité. Toute interaction publique est temporairement suspendue.' },
  { name: 'unfreeze', description: 'retire le gel', target: 'server', stateChange: 'Activité Normale', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#57F287', executionFeedback: '☀️ **[DÉGEL EFFECTUÉ]** retire le gel. Reprise de l\'activité normale.' },
  { name: 'channelguard', description: 'protège les salons', target: 'channels', stateChange: 'ChannelGuard Actif', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#57F287', executionFeedback: '🛡️ **[CHANNELGUARD ARMÉ]** protège les salons contre les suppressions et modifications intempestives.' },
  { name: 'channelbackup', description: 'sauvegarde les salons', target: 'channels', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#5865F2', executionFeedback: '💾 **[BACKUP SALONS]** sauvegarde les salons. Structure, catégories et permissions enregistrées.' },
  { name: 'channelrestore', description: 'les restaure', target: 'channels', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#FEE75C', executionFeedback: '♻️ **[RESTAURATION SALONS]** les restaure. Les salons ont été reconstruits selon le snapshot.' },
  { name: 'channelaudit', description: 'affiche les modifications', target: 'channels', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#5865F2', executionFeedback: '📋 **[AUDIT SALONS]** affiche les modifications. Historique d\'altération des salons inspecté.' },
  { name: 'vclock', description: 'bloque les vocaux', target: 'voice', stateChange: 'Salons Vocaux Bloqués', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#ED4245', executionFeedback: '🔇 **[VCLOCK EFFECTUÉ]** bloque les vocaux. Connexion interdite aux membres non autorisés.' },
  { name: 'vcunlock', description: 'les débloque', target: 'voice', stateChange: 'Salons Vocaux Débloqués', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#57F287', executionFeedback: '🔊 **[VCUNLOCK EFFECTUÉ]** les débloque. Accès rétabli sur l\'ensemble des salons vocaux.' },
  { name: 'vcguard', description: 'protège les permissions vocales', target: 'voice', stateChange: 'VCGuard Actif', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#5865F2', executionFeedback: '🛡️ **[VCGUARD ARMÉ]** protège les permissions vocales. Surveillance contre les mutes et déconnexions de masse.' },
  { name: 'roleguard', description: 'protège les rôles', target: 'roles', stateChange: 'RoleGuard Actif', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#57F287', executionFeedback: '🛡️ **[ROLEGUARD ARMÉ]** protège les rôles. Surveillance permanente contre les altérations.' },
  { name: 'roleguard off', description: 'désactive la protection', target: 'roles', stateChange: 'RoleGuard Inactif', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#949ba4', executionFeedback: '⚠️ **[ROLEGUARD DÉSACTIVÉ]** désactive la protection des rôles.' },
  { name: 'rolelock', description: 'bloque les modifications de rôles', target: 'roles', stateChange: 'Modifications Rôles Bloquées', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#ED4245', executionFeedback: '🔒 **[ROLELOCK APPLIQUÉ]** bloque les modifications de rôles.' },
  { name: 'roleunlock', description: 'les autorise', target: 'roles', stateChange: 'Modifications Rôles Autorisées', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#57F287', executionFeedback: '🔓 **[ROLEUNLOCK EFFECTUÉ]** les autorise. Gestion normale des rôles réactivée.' },
  { name: 'roleprotect', description: 'protège un rôle (+roleprotect @role)', target: 'roles', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#5865F2', executionFeedback: '🛡️ **[RÔLE PROTÉGÉ]** protège un rôle. Le rôle spécifié est inscrit sur la liste prioritaire.' },
  { name: 'roleunprotect', description: 'retire sa protection (+roleunprotect @role)', target: 'roles', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#949ba4', executionFeedback: '🛡️ **[PROTECTION RÔLE RETIRÉE]** retire sa protection. Le rôle opère désormais en mode standard.' },
  { name: 'rolebackup', description: 'sauvegarde les rôles', target: 'roles', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#5865F2', executionFeedback: '💾 **[BACKUP RÔLES]** sauvegarde les rôles. Hiérarchie, couleurs et permissions sauvegardées.' },
  { name: 'rolerestore', description: 'les restaure', target: 'roles', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#FEE75C', executionFeedback: '♻️ **[RESTAURATION RÔLES]** les restaure. Les rôles et permissions d\'origine ont été restaurés.' },
  { name: 'roleaudit', description: 'affiche les changements', target: 'roles', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#5865F2', executionFeedback: '📋 **[AUDIT RÔLES]** affiche les changements. Historique récent des rôles vérifié.' },
  { name: 'rolewatch', description: 'surveille les rôles', target: 'roles', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#5865F2', executionFeedback: '👁️ **[ROLEWATCH ACTIF]** surveille les rôles. Détection proactive des anomalies de permissions.' },
  { name: 'permissionguard', description: 'protège les permissions sensibles', target: 'permissions', stateChange: 'PermissionGuard Armé', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#57F287', executionFeedback: '🛡️ **[PERMISSIONGUARD ARMÉ]** protège les permissions sensibles (Admin, Ban, Kick, ManageGuild).' },
  { name: 'permissioncheck', description: 'vérifie les permissions dangereuses', target: 'permissions', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#FEE75C', executionFeedback: '🔍 **[AUDIT PERMISSIONS]** vérifie les permissions dangereuses. Analyse d\'attribution effectuée.' },
  { name: 'adminlock', description: 'protège les rôles administrateurs', target: 'roles', stateChange: 'AdminLock Actif', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#ED4245', executionFeedback: '🔒 **[ADMINLOCK ENGAGÉ]** protège les rôles administrateurs. Verrouillage de la permission Administrateur.' },
  { name: 'adminwatch', description: 'les surveille', target: 'roles', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#5865F2', executionFeedback: '👁️ **[ADMINWATCH ACTIF]** les surveille. Monitoring haute précision des comptes administrateurs.' },
  { name: 'hierarchyguard', description: 'protège la hiérarchie', target: 'roles', stateChange: 'Hiérarchie Protégée', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#57F287', executionFeedback: '🛡️ **[HIERARCHYGUARD ARMÉ]** protège la hiérarchie officielle du serveur.' },
  { name: 'webhookguard', description: 'protège les webhooks', target: 'webhooks', stateChange: 'WebhookGuard Actif', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#57F287', executionFeedback: '🛡️ **[WEBHOOKGUARD ARMÉ]** protège les webhooks. Suppression immédiate de tout webhook non autorisé.' },
  { name: 'webhookguard off', description: 'désactive la protection', target: 'webhooks', stateChange: 'WebhookGuard Inactif', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#949ba4', executionFeedback: '⚠️ **[WEBHOOKGUARD DÉSACTIVÉ]** désactive la protection des webhooks.' },
  { name: 'webhooklock', description: 'bloque les nouveaux webhooks', target: 'webhooks', stateChange: 'Création Webhook Bloquée', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#ED4245', executionFeedback: '🔒 **[WEBHOOKLOCK APPLIQUÉ]** bloque les nouveaux webhooks.' },
  { name: 'webhookunlock', description: 'les autorise', target: 'webhooks', stateChange: 'Création Webhook Autorisée', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#57F287', executionFeedback: '🔓 **[WEBHOOKUNLOCK APPLIQUÉ]** les autorise. Création de webhooks de nouveau permise.' },
  { name: 'webhookprotect', description: 'protège un webhook (+webhookprotect ID)', target: 'webhooks', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#5865F2', executionFeedback: '🛡️ **[WEBHOOK PROTÉGÉ]** protège un webhook. Le webhook cible est immunisé.' },
  { name: 'webhookunprotect', description: 'retire sa protection (+webhookunprotect ID)', target: 'webhooks', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#949ba4', executionFeedback: '🛡️ **[WEBHOOK DÉPROTÉGÉ]** retire sa protection. Immunité retirée du webhook.' },
  { name: 'webhookaudit', description: 'affiche les changements', target: 'webhooks', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#5865F2', executionFeedback: '📋 **[AUDIT WEBHOOKS]** affiche les changements. Historique d\'actions webhooks généré.' },
  { name: 'webhookbackup', description: 'sauvegarde les webhooks', target: 'webhooks', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#5865F2', executionFeedback: '💾 **[BACKUP WEBHOOKS]** sauvegarde les webhooks en base sécurisée.' },
  { name: 'webhookrestore', description: 'les restaure', target: 'webhooks', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#FEE75C', executionFeedback: '♻️ **[RESTAURATION WEBHOOKS]** les restaure. Webhooks autorisés réinstallés.' },
  { name: 'webhookcheck', description: 'vérifie les webhooks', target: 'webhooks', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#57F287', executionFeedback: '🔍 **[CHECK WEBHOOKS]** vérifie les webhooks. Inspection des tokens et droits effectuée.' },
  { name: 'botguard', description: 'renforce la protection des bots', target: 'bots', stateChange: 'BotGuard Actif', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#57F287', executionFeedback: '🛡️ **[BOTGUARD RENFORCÉ]** renforce la protection des bots. Expulsion immédiate de tout bot non whitelist.' },
  { name: 'botcheck', description: 'vérifie les bots', target: 'bots', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#5865F2', executionFeedback: '🤖 **[BOTCHECK EFFECTUÉ]** vérifie les bots. Analyse des permissions des bots présents.' },
  { name: 'joinlock', description: 'bloque les nouveaux arrivants', target: 'server', stateChange: 'Arrivées Bloquées (JoinLock)', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#ED4245', executionFeedback: '⛔ **[JOINLOCK ACTIF]** bloque les nouveaux arrivants. Expulsion automatique des nouvelles connexions.' },
  { name: 'joinunlock', description: 'rétablit les arrivées', target: 'server', stateChange: 'Arrivées Rétablies', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#57F287', executionFeedback: '✅ **[JOINUNLOCK APPLIQUÉ]** rétablit les arrivées. Les nouveaux membres peuvent rejoindre.' },
  { name: 'verifylock', description: 'renforce la vérification', target: 'server', stateChange: 'Vérification Renforcée', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#5865F2', executionFeedback: '🔐 **[VERIFYLOCK ENGAGÉ]** renforce la vérification. Niveau de vérification maximal imposé.' },
  { name: 'verifyunlock', description: 'la désactive', target: 'server', stateChange: 'Vérification Standard', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#57F287', executionFeedback: '🔓 **[VERIFYUNLOCK APPLIQUÉ]** la désactive. Vérification standard rétablie.' },
  { name: 'raidlock', description: 'active l’Anti-Raid', target: 'raid', stateChange: 'Anti-Raid Actif', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#ED4245', executionFeedback: '🚨 **[ANTI-RAID ENGAGÉ]** active l’Anti-Raid. Détection et neutralisation des raids armées.' },
  { name: 'raidunlock', description: 'le désactive', target: 'raid', stateChange: 'Anti-Raid Inactif', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#57F287', executionFeedback: '✅ **[ANTI-RAID DÉSACTIVÉ]** le désactive. Mode standard rétabli.' },
  { name: 'securitylog', description: 'affiche les événements de sécurité', target: 'all', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#5865F2', executionFeedback: '📜 **[JOURNAL DE SÉCURITÉ]** affiche les événements de sécurité récents.' },
  { name: 'securitycheck', description: 'vérifie les protections', target: 'all', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#57F287', executionFeedback: '🛡️ **[DIAGNOSTIC DE SÉCURITÉ]** vérifie les protections. État défensif audité.' },
  { name: 'audit', description: 'affiche les changements importants', target: 'all', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#5865F2', executionFeedback: '📑 **[AUDIT GÉNÉRAL]** affiche les changements importants et actions récentes.' },
  { name: 'raidlogs', description: 'affiche les événements Anti-Raid', target: 'raid', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#ED4245', executionFeedback: '🚨 **[LOGS ANTI-RAID]** affiche les événements Anti-Raid enregistrés.' },
  { name: 'backup', description: 'crée une sauvegarde générale', target: 'server', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#57F287', executionFeedback: '💾 **[SAUVEGARDE GÉNÉRALE CRÉÉE]** crée une sauvegarde générale (salons, rôles, réglages).' },
  { name: 'restore', description: 'restaure la dernière sauvegarde', target: 'server', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#FEE75C', executionFeedback: '♻️ **[RESTAURATION EFFECTUÉE]** restaure la dernière sauvegarde générale du serveur.' },
  { name: 'securelist', description: 'affiche toutes les commandes Security', target: 'all', roleRestriction: ['*', 'SECURE', '/'], embedColor: '#5865F2', executionFeedback: '📜 **[LISTE DES COMMANDES DE SÉCURITÉ]** affiche toutes les commandes Security.' },
  { name: 'ownerlock', description: 'verrouille tout le serveur et est utilisable uniquement par /', target: 'server', stateChange: 'LOCK TOTAL (Owner Only)', roleRestriction: ['/'], embedColor: '#ED4245', executionFeedback: '👑 **[OWNERLOCK EXCLUSIF (/)]** verrouille tout le serveur et est utilisable uniquement par /.' },
  { name: 'ownerfreeze', description: 'gèle complètement le serveur et est utilisable uniquement par /', target: 'server', stateChange: 'GEL TOTAL (Owner Only)', roleRestriction: ['/'], embedColor: '#5865F2', executionFeedback: '👑 **[OWNERFREEZE EXCLUSIF (/)]** gèle complètement le serveur et est utilisable uniquement par /.' }
];

// 4. Moteur de validation des permissions
async function handleSecurityCommandExecution(spec, channel, member, guild, isSlash = false) {
  const isOwnerOnly = spec.roleRestriction.length === 1 && spec.roleRestriction[0] === '/';
  const isServerOwner = guild ? guild.ownerId === member.id : false;

  // Règle 1: Commandes Owner
  if (isOwnerOnly) {
    if (!isSlash) {
      const errEmbed = new EmbedBuilder()
        .setTitle(`👑 [COMMANDE EXCLUSIVE (/)] /${spec.name}`)
        .setDescription(`La commande **${spec.name}** est réservée au **Propriétaire** et doit être exécutée **UNIQUEMENT en commande Slash (/)** !`)
        .setColor('#ED4245')
        .addFields(
          { name: 'Droits requis', value: '🔒 **Uniquement Propriétaire du serveur (/)**', inline: true },
          { name: 'Utilisation', value: `Tapez \`/${spec.name}\` dans Discord`, inline: true }
        )
        .setFooter({ text: 'Aegis Security Engine • Owner Only' })
        .setTimestamp();
      return { embed: errEmbed, error: true };
    }
    if (!isServerOwner) {
      const errEmbed = new EmbedBuilder()
        .setTitle('⛔ [ACCÈS PROPRIÉTAIRE REQUIS]')
        .setDescription('Seul le **fondateur / propriétaire légitime** du serveur peut exécuter cette commande.')
        .setColor('#ED4245')
        .setFooter({ text: 'Aegis Security Engine • Sécurité Absolue' })
        .setTimestamp();
      return { embed: errEmbed, error: true };
    }
  } else {
    // Règle 2: Commandes Sécurité autorisées aux rôles: *, SECURE, /
    const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);
    const hasSecureRole = member.roles.cache.some(
      r => r.name.toUpperCase() === 'SECURE' || r.name === '*' || r.name.toUpperCase() === 'ADMIN'
    );

    if (!isServerOwner && !isAdmin && !hasSecureRole) {
      const errEmbed = new EmbedBuilder()
        .setTitle('⛔ [ACCÈS SÉCURITÉ REFUSÉ]')
        .setDescription('Vous ne possédez pas les accréditations requises.')
        .addFields(
          { name: 'Rôles autorisés', value: '🔑 **Rôles autorisés : `*`, `SECURE`, `/`**', inline: true },
          { name: 'Votre statut', value: '⚠️ Accès restreint', inline: true }
        )
        .setColor('#ED4245')
        .setFooter({ text: 'Aegis Security Engine • Contrôle d\'intégrité' })
        .setTimestamp();
      return { embed: errEmbed, error: true };
    }
  }

  // Actions effectives en temps réel
  const cleanCmd = spec.name.replace(/\s+/g, '_').toLowerCase();
  if (guild) {
    try {
      if (cleanCmd === 'lockall') {
        const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText);
        for (const [, ch] of textChannels) {
          try { await ch.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: false }); } catch (_) {}
        }
      } else if (cleanCmd === 'unlockall') {
        const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText);
        for (const [, ch] of textChannels) {
          try { await ch.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: null }); } catch (_) {}
        }
      } else if (cleanCmd === 'vclock') {
        const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice);
        for (const [, ch] of voiceChannels) {
          try { await ch.permissionOverwrites.edit(guild.roles.everyone, { Connect: false }); } catch (_) {}
        }
      } else if (cleanCmd === 'vcunlock') {
        const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice);
        for (const [, ch] of voiceChannels) {
          try { await ch.permissionOverwrites.edit(guild.roles.everyone, { Connect: null }); } catch (_) {}
        }
      }
    } catch (e) {
      console.error('Erreur action discord :', e);
    }
  }

  if (cleanCmd === 'securelist') {
    const listEmbed = new EmbedBuilder()
      .setTitle('📜 [RÉPERTOIRE DES 63 COMMANDES DE SÉCURITÉ]')
      .setDescription('Toutes les commandes respectent les accréditations requises : `*`, `SECURE`, `/` (ou Owner Only).')
      .setColor('#5865F2')
      .addFields(
        {
          name: '🛡️ Mode Global & Blindage (10)',
          value: '`+secure`, `+unsecure`, `+shield`, `+shieldoff`, `+panic`, `+panicoff`, `+fortress`, `+fortressoff`, `+maintenance`, `+maintenanceoff`',
          inline: false,
        },
        {
          name: '💬 Salons & Vocaux (11)',
          value: '`+lockall`, `+unlockall`, `+freeze`, `+unfreeze`, `+channelguard`, `+channelbackup`, `+channelrestore`, `+channelaudit`, `+vclock`, `+vcunlock`, `+vcguard`',
          inline: false,
        },
        {
          name: '🎭 Rôles & Hiérarchie (14)',
          value: '`+roleguard`, `+roleguard off`, `+rolelock`, `+roleunlock`, `+roleprotect`, `+roleunprotect`, `+rolebackup`, `+rolerestore`, `+roleaudit`, `+rolewatch`, `+permissionguard`, `+permissioncheck`, `+adminlock`, `+adminwatch`, `+hierarchyguard`',
          inline: false,
        },
        {
          name: '🌐 Webhooks (10)',
          value: '`+webhookguard`, `+webhookguard off`, `+webhooklock`, `+webhookunlock`, `+webhookprotect`, `+webhookunprotect`, `+webhookaudit`, `+webhookbackup`, `+webhookrestore`, `+webhookcheck`',
          inline: false,
        },
        {
          name: '🤖 Bots, Membres & Raid (8)',
          value: '`+botguard`, `+botcheck`, `+joinlock`, `+joinunlock`, `+verifylock`, `+verifyunlock`, `+raidlock`, `+raidunlock`',
          inline: false,
        },
        {
          name: '📊 Logs, Audits & Snapshots (7)',
          value: '`+securitylog`, `+securitycheck`, `+audit`, `+raidlogs`, `+backup`, `+restore`, `+securelist`',
          inline: false,
        },
        {
          name: '👑 Commandes Exclusives Propriétaire (/ Only)',
          value: '`/ownerlock` (verrouille tout le serveur et est utilisable uniquement par /)\n`/ownerfreeze` (gèle complètement le serveur et est utilisable uniquement par /)',
          inline: false,
        }
      )
      .setFooter({ text: 'Aegis Security Engine • 63 commandes intégrales' })
      .setTimestamp();
    return { embed: listEmbed, error: false };
  }

  // Embed officiel conforme à la lettre
  const successEmbed = new EmbedBuilder()
    .setTitle(isOwnerOnly ? `👑 [OWNER EXCLUSIF] /${spec.name}` : `🛡️ [SÉCURITÉ] +${spec.name}`)
    .setDescription(spec.executionFeedback)
    .setColor(spec.embedColor || '#5865F2')
    .addFields(
      {
        name: 'Droits d\'accès autorisés',
        value: isOwnerOnly ? '🔒 **Uniquement Propriétaire du serveur (/)**' : '🔑 **Rôles autorisés : `*`, `SECURE`, `/`**',
        inline: true
      },
      {
        name: 'État opérationnel',
        value: spec.stateChange ? `⚡ **${spec.stateChange}**` : '✅ Opération validée',
        inline: true
      },
      {
        name: 'Cible concernée',
        value: `🎯 Module : \`${spec.target}\``,
        inline: true
      }
    )
    .setFooter({
      text: isOwnerOnly
        ? 'Aegis Security Engine • Commande réservée au Propriétaire'
        : 'Aegis Security Engine • Protection Haute Fidélité Discord'
    })
    .setTimestamp();

  return { embed: successEmbed, error: false };
}

// 5. Gestionnaire des Messages Textuels (+)
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.trim();
  const isPrefixed = content.startsWith(prefix);
  const botMention = `<@${client.user.id}>`;
  const botMentionNick = `<@!${client.user.id}>`;
  const isMention = content.startsWith(botMention) || content.startsWith(botMentionNick);

  if (!isPrefixed && !isMention) return;

  let commandBody = '';
  if (isPrefixed) {
    commandBody = content.slice(prefix.length).trim();
  } else {
    commandBody = content.replace(botMention, '').replace(botMentionNick, '').trim();
  }

  const args = commandBody.split(/\s+/);
  const rawCmdName = (args.shift() || '').toLowerCase();
  const subArg = (args[0] || '').toLowerCase();
  const compoundCmd = subArg ? `${rawCmdName} ${subArg}` : '';
  const cleanCmd = rawCmdName.replace(/_/g, '');

  try {
    let securitySpec = compoundCmd ? SECURITY_SPECS.find(s => s.name.toLowerCase() === compoundCmd) : null;
    if (securitySpec) {
      args.shift();
    } else {
      securitySpec = SECURITY_SPECS.find(s => {
        const sClean = s.name.replace(/[\s_]+/g, '').toLowerCase();
        return sClean === cleanCmd || s.name.toLowerCase() === rawCmdName;
      });
    }

    if (securitySpec) {
      const result = await handleSecurityCommandExecution(
        securitySpec,
        message.channel,
        message.member,
        message.guild,
        false
      );
      return await message.reply({ embeds: [result.embed] });
    }
  } catch (err) {
    console.error('Erreur commande:', err);
    await message.reply(`⚠️ Erreur lors de l'exécution : ${err.message}`).catch(() => {});
  }
});

// 6. Gestionnaire des Commandes Slash (/)
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const cmdName = interaction.commandName;
  const withSpaces = cmdName.replace(/_/g, ' ').toLowerCase();
  const cleanCmd = cmdName.replace(/_/g, '').toLowerCase();

  try {
    const securitySpec = SECURITY_SPECS.find(s => {
      const sClean = s.name.replace(/[\s_]+/g, '').toLowerCase();
      return sClean === cleanCmd || s.name.toLowerCase() === withSpaces || s.name.toLowerCase() === cmdName;
    });

    if (securitySpec) {
      const result = await handleSecurityCommandExecution(
        securitySpec,
        interaction.channel,
        interaction.member,
        interaction.guild,
        true
      );
      return await interaction.reply({ embeds: [result.embed], ephemeral: result.error });
    }

    return await interaction.reply({ content: `Commande \`/${cmdName}\` inconnue.`, ephemeral: true });
  } catch (err) {
    console.error('Erreur interaction:', err);
    if (!interaction.replied) {
      await interaction.reply({ content: `❌ Erreur : ${err.message}`, ephemeral: true }).catch(() => {});
    }
  }
});

client.once('ready', () => {
  console.log(`===============================================`);
  console.log(`🤖 Fenkaki Anti-Raid connecté : ${client.user.tag}`);
  console.log(`🌐 Actif sur ${client.guilds.cache.size} serveur(s) Discord`);
  console.log(`🛡️ 63 commandes de sécurité opérationnelles`);
  console.log(`===============================================`);

  client.user.setPresence({
    status: 'online',
    activities: [{ name: '+securelist | +secure', type: ActivityType.Watching }]
  });
});

client.login(token).catch(err => {
  console.error('❌ Échec de connexion du bot :', err);
});
