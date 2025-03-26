<template>
    <div class="t10-leaderboard-container">
        <div v-for="(player, index) in players" :key="player.uid" 
             class="leaderboard-row" :id="'rank-' + (index + 1)">
            
            <div class="event-rank">
                <img v-if="index < 3" :src="'/en_' + (index + 1) + '.png'" />
                <span v-else>#{{ index + 1 }}</span>
            </div>
            
            <div class="user-icon">
                <img v-if="player.iconUrl" :src="player.iconUrl" alt="User icon" />
            </div>

            <div class="user-name-desc">
                <span class="username" v-html="formatText(player.name)"></span>
                <span class="userDesc" v-html="formatText(player.introduction)"></span>
            </div>
            
            <div class="user-rank-id-pts">
                <span class="userRank">Rank {{ player.rank }}</span>
                <span class="userId">#{{ player.uid }}</span>
                <span class="userPts">{{ player.points.toLocaleString() }} Pts</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';
import DOMPurify from 'dompurify';

interface PlayerData {
    uid: number;
    name: string;
    introduction: string;
    rank: number;
    points: number;
    iconUrl?: string;
}

export default class TopRankings extends Vue {
    private players: PlayerData[] = [];
    private isLoading = true;

    private formatText(text: string): string {
        if (!text) return '';
        
        let formatted = text
            .replace(/\[C\]/g, '')
            .replace(/\[([a-f0-9]{6})\]/gi, '<span style="color: #$1">')
            .replace(/\[b\]/g, '<strong>').replace(/\[\/b\]/g, '</strong>')
            .replace(/\[c\]/g, '<span style="display: inline-block; text-align: center">')
            .replace(/\[\/c\]/g, '</span>')
            .replace(/\[sup\]/g, '<sup>').replace(/\[\/sup\]/g, '</sup>')
            .replace(/\[sub\]/g, '<sub>').replace(/\[\/sub\]/g, '</sub>')
            .replace(/\[\/([a-z]+)\]?/gi, '</$1>');

        return DOMPurify.sanitize(formatted, {
            ALLOWED_TAGS: ['span', 'strong', 'sup', 'sub'],
            ALLOWED_ATTR: ['style']
        });
    }

    private async fetchUserIcon(uid: number): Promise<string> {
        try {
            const response = await fetch(`http://localhost:3000/api/user-icon/${uid}`);
            const data = await response.json();
            return data.iconUrl || '';
        } catch (error) {
            console.error('Error fetching icon:', error);
            return '';
        }
    }

    private async fetchLeaderboardData() {
        try {
            const response = await fetch('http://localhost:3000/api/leaderboard');
            const data = await response.json();
            
            // process t10
            const topPlayers = data.points.slice(0, 10).map(async (point: any) => {
                const user = data.users.find((u: any) => u.uid === point.uid);
                const iconUrl = await this.fetchUserIcon(point.uid);
                
                return {
                    uid: point.uid,
                    name: user?.name || 'Unknown',
                    introduction: user?.introduction || '',
                    rank: user?.rank || 0,
                    points: point.value,
                    iconUrl
                };
            });
            
            // wait for icons load
            this.players = await Promise.all(topPlayers);
            
        } catch (error) {
            console.error(error);
        } finally {
            this.isLoading = false;
        }
    }

    mounted(): void {
        this.fetchLeaderboardData();
    }
}
</script>

<style>
    .leaderboard-row {
        width: 600px;
        height: 70px;
        background-color: rgba(245, 245, 245, 0.4);
        border-radius: 10px;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 20px;
        margin-bottom: 10px;
    }

    .event-rank {
        width: 128px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .user-icon {
        width: 64px;
        height: 64px;
        border-radius: 10px;
        background-color: aliceblue; /* Placeholder */
        flex-shrink: 0;
    }

    .user-icon img {
        width: 64px;
        height: 64px;
    }

    .t10-leaderboard-container {
        position: relative;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 1%;
    }

    .user-name-desc {
        width: 40%;
    }

    .user-rank-id-pts,
    .user-name-desc {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .username,
    .userDesc {
        line-height: 1.3;
    }

    .username strong, 
    .userDesc strong {
        font-weight: bold;
    }

    .username sup, 
    .userDesc sup {
        vertical-align: super;
        font-size: 0.8em;
    }

    .username sub, 
    .userDesc sub {
        vertical-align: sub;
        font-size: 0.8em;
    }

    .username [style*="text-align: center"], 
    .userDesc [style*="text-align: center"] {
        display: block;
        text-align: center;
    }
</style>

<!-- https://bestdori.com/assets/en/thumb/chara/card00002_rip/res017005_normal.png (t1 example)

https://bestdori.com/assets/en/thumb/chara/card{formattedCardResourceId}_rip/{iconResourceSetName}_{iconStatus}.png

for cardResourceId,
get the sid from http://localhost:3000/api/leaderboard, assume t1,
let userSid = response.users.[0].sid
then,
resolve https://bestdori.com/api/cards/{userSid}.json
then, let iconResourceSetName = response.resourceSetName
and
let cardResourceId = response.episodes.entries.[0].costs.entries.[0].resourceId
let formattedCardResourceId = String(cardResourceId).padStart(5, '0')

resolve http://localhost:3000/api/leaderboard
then 
let playerUid = response.users.[0].uid

resolve https://bestdori.com/api/player/en/{playerUid}?mode=2
then
let iconStatus = response.data.profile.userProfileSituation.illust

after all data is gotten

fetch https://bestdori.com/assets/en/thumb/chara/card{formattedCardResourceId}_rip/{iconResourceSetName}_{iconStatus}.png
then dynamically set as icon for each "player" row  -->

