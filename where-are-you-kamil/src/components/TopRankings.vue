<template>
    <div class="t10-leaderboard-container">
        <div v-for="(player, index) in players" :key="player.uid" 
             class="leaderboard-row" :id="'rank-' + (index + 1)">
            
            <div class="event-rank">
                <img v-if="index < 3" :src="'/en_' + (index + 1) + '.png'" />
                <span v-else>#{{ index + 1 }}</span>
            </div>
            
            <div class="user-icon"></div>
            
            <div class="user-name-desc">
                <span class="username">{{ player.name }}</span>
                <span class="userDesc">{{ player.introduction }}</span>
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

interface PlayerData {
    uid: number;
    name: string;
    introduction: string;
    rank: number;
    points: number;
}

export default class TopRankings extends Vue {
    private players: PlayerData[] = [];
    private isLoading = true;

    private async fetchLeaderboardData() {
        try {
            const response = await fetch('http://localhost:3000/api/leaderboard');
            const data = await response.json();
            
            this.players = data.points.map((point: any) => {
                const user = data.users.find((u: any) => u.uid === point.uid);
                return {
                    uid: point.uid,
                    name: user?.name || 'Unknown',
                    introduction: user?.introduction || '',
                    rank: user?.rank || 0,
                    points: point.value
                };
            }).slice(0, 10);
            
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
</style>