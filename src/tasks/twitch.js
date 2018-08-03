const { Task } = require('klasa');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

// 375828283184513033 guild principal

module.exports = class extends Task {

	async run() {
		const url = new URL('https://api.twitch.tv/kraken/streams/');
		const guild = this.client.guilds.get('420911335187152909');
		if (!guild) return false;

		const r = this.client.providers.default.db;

		const canal = guild.channels.get(guild.configs.channels.twitch);
		if (!canal) return false;

		const usuarios = await r.table('streamers');
		if (!usuarios.length) return false;

		const channels = usuarios.map(usuario => usuario.nombreCuentaTwitch).join(',');

		url.search = new URLSearchParams([['channel', channels], ['stream_type', 'live'], ['game', 'Sea of Thieves'], ['client_id', 'radjtg8zklal4pt79x0xdxfucsk61z']]);
		const body = await fetch(url).then(result => result.json());

		for (const stream of body.streams) {
			let entry = await r.table('streams').get(stream.id);
			const streamers = await r.table('streamers');
			let nuevo = false;
			if (!entry) {
				nuevo = true;
				entry = { id: stream.id, createdAt: stream.created_at };
				await r.table('streams').get(stream.id).insert(entry);
			}

			if ((nuevo || entry.createdAt !== stream.created_at) && stream.game === 'Sea of Thieves') {
				if (!nuevo) await r.table('streams').get(stream.id).update({ createdAt: stream.created_at });
				const streamerProfile = streamers.find(streamer => streamer.nombreCuentaTwitch === stream.channel.display_name);
				const imagen = streamerProfile ? await guild.members.fetch(streamerProfile.id)
					.then(member => member.user.displayAvatarURL())
					.catch(() => undefined) : undefined;
				await canal.send(new MessageEmbed()
					.setAuthor(stream.channel.display_name, imagen)
					.setThumbnail(stream.channel.logo)
					.setImage(stream.preview.large)
					.addField('Juego:', stream.game, true)
					.addField('Seguidores:', stream.channel.followers, true)
					.setColor(8478656));
			}
		}

		return true;
	}

};