const Comando = require('../../estructuras/Comando');
const Discord = require('discord.js');

var urlBarco;

module.exports = class extends Comando {

	constructor(...args) {
		super(...args, {
			permlevel: 3,
			cooldown: 15,
			requiredSettings: ['busco'],
			description: 'Por añadir',
			extendedHelp: '+busco',
			comando: '+busco'
		});
	}

	async run(msg) {
		const voiceChannel = msg.member.voiceChannel;
		if (!voiceChannel) { return msg.send(`**${msg.author} debes conectarte a un barco para pedir tripulación.** 🚢`); }
		if (msg.guid !== voiceChannel.guid) { return msg.send(`**${msg.author} debes conectarte a un barco para pedir tripulación.** 🚢`); }
		if (voiceChannel.full) { return msg.send(`**${msg.author} no puedes pedir más tripulantes ¡tu barco ya está lleno!** 🚫`); }

		const usuariosNecesarios = voiceChannel.userLimit - voiceChannel.members.array().length;
		const canal = msg.guild.channels.get(msg.guild.configs.busco);

		await voiceChannel.createInvite().then(invite => urlset(invite.url));

		const embedBarco = new Discord.MessageEmbed()
			.setTitle('Click aqui para zarpar')
			.setURL(urlBarco)
			.setColor(0x00ced1)
			.addField(`_Busco **${usuariosNecesarios}** ${usuariosNecesarios === 1 ? 'pirata' : 'piratas'} en el barco ${voiceChannel.name} para zarpar._`, 'Embarcate !!!');

		canal.send(`**${msg.author} dice:**`);
		canal.send(embedBarco);
		canal.send('[<@&430418605423853568>]');

		return true;
	}

};

async function urlset(url) {
	urlBarco = url;
}
