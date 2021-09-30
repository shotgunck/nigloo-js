


const Discord = require('discord.js')
const axios = require('axios')

const config = require('../config.json')

const commands = {
    filter: async(message, arg2, distube) => {
      if (!arg2) return message.channel.send('🌫 You can set the filter with: `3d | bassboost | echo | karaoke | nightcore | vaporwave | flanger | gate | haas | reverse | surround | mcompand | phaser | tremolo | earwax`\nExample: `'+config.prefix+' filter reverse`')

      if (!distube.getQueue(message)) return message.channel.send('\\🌫 Oui play some sound to set filter ight')

      const filter = distube.setFilter(message, arg2)
      message.channel.send("🌫 Filter is now set to `" + (filter || 'off')+'`');
    },

    lyrics: async(message, arg2, distube) => {
      let queue = distube.getQueue(message)
      if (!queue) return message.channel.send("🕳 Play a sound so I can get the lyrics aight")

      queue.songs.map((song, id) => {
        let data = song.name.split(' - ')
        axios.get('https://api.lyrics.ovh/v1/'+data[0]+'/'+data[1])
        .then(res => {
          message.channel.send('Lyrics for sound: **'+data[1]+'**\n'+res.data.lyrics+'\n--------------------------------', {split: true})
        })
        .catch(err => {
          message.channel.send('💤 No lyrics found.,. | '+err)
        }) 
      })
    },

    play: async (message, arg2, distube) => {
        message.channel.startTyping(3)
        const voiceChannel = message.member.voice.channel
        if (!voiceChannel) return message.channel.send("Enter a voice channel pls!")
 
        const permissions = voiceChannel.permissionsFor(message.client.user)
        if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) return message.channel.send("I don't have the permission to join or speak in the channel 😭")
        
        if (!arg2) return message.channel.send("Play what mf,.,")
        
        const args = message.content.slice(config.prefix.length).trim().split(/ +/g)
        distube.play(message, args.join(" "))
    
        message.channel.stopTyping()
    },

    stop: async (message, _, distube) => {
        if (!message.member.voice.channel) return message.channel.send("🤏 Can't stop me, u need to be in the channel!")
        if (!distube.getQueue(message)) return ("🗑 There are no songs around,.")

        await distube.stop(message)
        message.channel.send('😴 All sounds have stopped and queue has been cleared. I\'m out,.,')
    },

    skip: async (message, _, distube) => {
        if (!message.member.voice.channel) return message.channel.send("🙄 You're not listening..,")
        if (!distube.getQueue(message)) return message.channel.send("No song to skip,, Play some!!")
        
        distube.skip(message);
        message.channel.send('\\⏯ **Skipped!**')
    },

    queue: async (message, _, distube) => {
        let queue = distube.getQueue(message)
        if (!queue) return message.channel.send("🕳 Queue empty..,")
        
        message.channel.send({ embed: new Discord.MessageEmbed()
            .setColor('#DD6E0F')
            .setTitle('Current Queue')
            .addFields(
            {name: '​', value: queue.songs.map((song, id) => `**${id+1}**. [${song.name}](${song.url}) - \`${song.formattedDuration}\`` )},
            ) 
        })
    },

    repeat: async (message, arg2, distube) => {
        if (!message.member.voice.channel) return message.channel.send("🙄 Join VC to repeat listening.,")
        if (!distube.getQueue(message)) return message.channel.send("🕳 No song currently,,")
        
        if (!arg2 || arg2 === 'on') {
            await distube.setRepeatMode(message, 1)
            message.channel.send('🔄 Current song is on repeat ight!')
        } else if (arg2 === 'off') {
            await distube.setRepeatMode(message, 0);
            message.channel.send('🔄 Repeat mode is now `off`.')
        }   
    },

    volume: async (message, arg2, distube) => {
        if (!message.member.voice.channel) return message.channel.send("🙄 Join VC to change volume!")
        if (!distube.getQueue(message)) return message.channel.send("No song around tho,,")
   
        if (!arg2) {
            message.channel.send("⚠ Select a volume level mf!!")
        } else if (parseInt(arg2) < 301 && parseInt(arg2) > -1) {
            await distube.setVolume(message, arg2);
            message.channel.send("🔢 Oki volume has been set to `"+arg2+"`")
        } else {
            message.channel.send("💢 Volume can only be set from `0` to `300`")
        }
    }
}

module.exports = commands