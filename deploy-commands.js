// [+] Déploiement des commandes Slash Discord
require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID || '1552381611650326700';

if (!token || token.includes('VOTRE_TOKEN')) {
  console.error("❌ ERREUR : La variable d'environnement DISCORD_TOKEN n'est pas définie.");
  process.exit(1);
}

const SECURITY_SPECS = [
  { name: 'secure', description: 'active toutes les protections' },
  { name: 'unsecure', description: 'désactive le mode sécurité' },
  { name: 'shield', description: 'active toutes les protections' },
  { name: 'shieldoff', description: 'les désactive' },
  { name: 'panic', description: 'active le mode urgence' },
  { name: 'panicoff', description: 'le désactive' },
  { name: 'fortress', description: 'active la sécurité maximale' },
  { name: 'fortressoff', description: 'la désactive' },
  { name: 'maintenance', description: 'active la maintenance' },
  { name: 'maintenanceoff', description: 'la désactive' },
  { name: 'lockall', description: 'verrouille tous les salons' },
  { name: 'unlockall', description: 'les déverrouille' },
  { name: 'freeze', description: 'bloque l’activité' },
  { name: 'unfreeze', description: 'retire le gel' },
  { name: 'channelguard', description: 'protège les salons' },
  { name: 'channelbackup', description: 'sauvegarde les salons' },
  { name: 'channelrestore', description: 'les restaure' },
  { name: 'channelaudit', description: 'affiche les modifications' },
  { name: 'vclock', description: 'bloque les vocaux' },
  { name: 'vcunlock', description: 'les débloque' },
  { name: 'vcguard', description: 'protège les permissions vocales' },
  { name: 'roleguard', description: 'protège les rôles' },
  { name: 'roleguard off', description: 'désactive la protection' },
  { name: 'rolelock', description: 'bloque les modifications de rôles' },
  { name: 'roleunlock', description: 'les autorise' },
  { name: 'roleprotect', description: 'protège un rôle (+roleprotect @role)', options: [{ name: 'role', description: 'Le rôle à protéger', required: true }] },
  { name: 'roleunprotect', description: 'retire sa protection (+roleunprotect @role)', options: [{ name: 'role', description: 'Le rôle à déprotéger', required: true }] },
  { name: 'rolebackup', description: 'sauvegarde les rôles' },
  { name: 'rolerestore', description: 'les restaure' },
  { name: 'roleaudit', description: 'affiche les changements' },
  { name: 'rolewatch', description: 'surveille les rôles' },
  { name: 'permissionguard', description: 'protège les permissions sensibles' },
  { name: 'permissioncheck', description: 'vérifie les permissions dangereuses' },
  { name: 'adminlock', description: 'protège les rôles administrateurs' },
  { name: 'adminwatch', description: 'les surveille' },
  { name: 'hierarchyguard', description: 'protège la hiérarchie' },
  { name: 'webhookguard', description: 'protège les webhooks' },
  { name: 'webhookguard off', description: 'désactive la protection' },
  { name: 'webhooklock', description: 'bloque les nouveaux webhooks' },
  { name: 'webhookunlock', description: 'les autorise' },
  { name: 'webhookprotect', description: 'protège un webhook (+webhookprotect ID)', options: [{ name: 'webhook_id', description: 'ID du webhook', required: true }] },
  { name: 'webhookunprotect', description: 'retire sa protection (+webhookunprotect ID)', options: [{ name: 'webhook_id', description: 'ID du webhook', required: true }] },
  { name: 'webhookaudit', description: 'affiche les changements' },
  { name: 'webhookbackup', description: 'sauvegarde les webhooks' },
  { name: 'webhookrestore', description: 'les restaure' },
  { name: 'webhookcheck', description: 'vérifie les webhooks' },
  { name: 'botguard', description: 'renforce la protection des bots' },
  { name: 'botcheck', description: 'vérifie les bots' },
  { name: 'joinlock', description: 'bloque les nouveaux arrivants' },
  { name: 'joinunlock', description: 'rétablit les arrivées' },
  { name: 'verifylock', description: 'renforce la vérification' },
  { name: 'verifyunlock', description: 'la désactive' },
  { name: 'raidlock', description: 'active l’Anti-Raid' },
  { name: 'raidunlock', description: 'le désactive' },
  { name: 'securitylog', description: 'affiche les événements de sécurité' },
  { name: 'securitycheck', description: 'vérifie les protections' },
  { name: 'audit', description: 'affiche les changements importants' },
  { name: 'raidlogs', description: 'affiche les événements Anti-Raid' },
  { name: 'backup', description: 'crée une sauvegarde générale' },
  { name: 'restore', description: 'restaure la dernière sauvegarde' },
  { name: 'securelist', description: 'affiche toutes les commandes Security' },
  { name: 'ownerlock', description: 'verrouille tout le serveur et est utilisable uniquement par /' },
  { name: 'ownerfreeze', description: 'gèle complètement le serveur et est utilisable uniquement par /' }
];

const commands = [];

for (const spec of SECURITY_SPECS) {
  const cleanName = spec.name.replace(/\s+/g, '_').toLowerCase();
  const builder = new SlashCommandBuilder()
    .setName(cleanName)
    .setDescription(spec.description.slice(0, 100));

  if (spec.options) {
    for (const opt of spec.options) {
      builder.addStringOption(o =>
        o.setName(opt.name.toLowerCase()).setDescription(opt.description).setRequired(opt.required)
      );
    }
  }
  commands.push(builder.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log(`🔄 Déploiement de ${commands.length} commandes Slash (/) en cours...`);
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log(`✅ ${commands.length} commandes Slash déployées avec succès auprès de Discord !`);
  } catch (err) {
    console.error('❌ Erreur lors du déploiement des commandes :', err);
  }
})();
