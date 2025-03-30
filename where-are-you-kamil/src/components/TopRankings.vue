<template>
    <div class="t10-leaderboard-container">
        <div v-for="(player, index) in players" :key="player.uid" class="leaderboard-row-container">
            <div class="leaderboard-row" :id="'rank-' + (index + 1)">
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

            <div class="data-box">
                <span>Differential (per last hourly snapshot)</span>
                <span class="differential-pts"
                    v-if="differencesCalculated && differences.length > index && differences[index] !== undefined">
                    +{{ differences[index].toLocaleString() }} Points
                    <span class="tooltip-text">Data Snapshot was fetched @ {{ snapshotTime }}</span>
                </span>
                <span> Pts/2 mins: </span>
                <span v-if="finalPaceValues.length > 0 && finalPaceValues[index] !== undefined" class="pts-min">
                    {{ finalPaceValues[index].toLocaleString() }}
                </span>
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

interface IntervalPlayerData {
    uid: number;
    points: number;
    time: number;
}

export default class TopRankings extends Vue {
    private players: PlayerData[] = [];
    private filteredPlayers: IntervalPlayerData[] = [];
    private finalPaceValues: number[] = []; 
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    private isLoading = true;
    private differencesCalculated = false;
    private snapshotTime = '';

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

    private readonly API_BASE = import.meta.env.DEV 
    ? '/api' 
    : 'https://where-are-you-kamil.vercel.app/api';

    private async fetchUserIcon(uid: number): Promise<string> {
        try {
            const response = await fetch(`${this.API_BASE}/user-icon/${uid}`);
            if (!response.ok) throw new Error('Failed to fetch icon');
            const data = await response.json();
            return data.iconUrl || this.getFallbackIconUrl();
        } catch (error) {
            console.error('Error fetching icon:', error);
            return this.getFallbackIconUrl();
        }
    }

    private getFallbackIconUrl(): string {
        return 'https://bestdori.com/assets/en/thumb/chara/card00000_rip/default_normal.png';
    }

    private async fetchLeaderboardData() {
        this.isLoading = true;
        try {
            const response = await fetch(`${this.API_BASE}/leaderboard`);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    `HTTP ${response.status}: ${errorData.message || 'Failed to fetch leaderboard'}`
                );
            }

            const data = await response.json();
            
            const topPlayersPromises = data.points.slice(0, 10).map(async (point: any) => {
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
            
            this.players = await Promise.all(topPlayersPromises);
        } catch (error) {
            console.error('Leaderboard fetch error:', error);
        } finally {
            this.isLoading = false;
        }
    }

    private convertEpochToGMT8(epochTime: number): string {
        const date = new Date(epochTime);
        return date.toLocaleTimeString('en-US', {
            timeZone: 'Asia/Singapore',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    }

    private async fetchIntervalData() {
        this.isLoading = true;
        try {
            const response = await fetch(`${this.API_BASE}/intervaldata`);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    `HTTP ${response.status}: ${errorData.message || 'Failed to fetch interval data'}`
                );
            }

            const data = await response.json();
            
            data.points.splice(-10, 10); 

            this.filteredPlayers = data.points.slice(-10).map((point: any) => ({
                uid: point.uid,
                points: point.value,
                time: point.time       
            }));

            if (this.filteredPlayers.length > 0) {
                this.snapshotTime = this.convertEpochToGMT8(
                    this.filteredPlayers[this.filteredPlayers.length - 1].time
                );
            }
        } catch (error) {
            console.error('Interval data fetch error:', error);
        } finally {
            this.isLoading = false;
        }
    }

    get differences(): number[] {
        if (!this.players.length || !this.filteredPlayers.length) {
            return [];
        }
        return this.players.map((player, index) => 
            player.points - (this.filteredPlayers[index]?.points || 0)
        );
    }

    private async paceCalculations() {
        this.isLoading = true;
        try {
            const startResponse = await fetch(`${this.API_BASE}/startdata`);
            if (!startResponse.ok) {
                throw new Error(`Failed to fetch start data: HTTP ${startResponse.status}`);
            }
            const startData = await startResponse.json();

            const startingT10 = startData.points.slice(0, 10).map((point: any) => {
                const user = startData.users.find((u: any) => u.uid === point.uid);
                return {
                    uid: point.uid,
                    name: user?.name || 'Unknown',
                    points: point.value,
                    time: point.time,
                };
            });

            const leaderboardResponse = await fetch(`${this.API_BASE}/leaderboard`);
            if (!leaderboardResponse.ok) {
                throw new Error(`Failed to fetch leaderboard: HTTP ${leaderboardResponse.status}`);
            }
            const leaderboardData = await leaderboardResponse.json();

            this.finalPaceValues = [];

            // add calcs here
            for (let i = 0; i < leaderboardData.points.length && i < 10; i++) {
                const timeDifference = leaderboardData.points[i].time - startingT10[i].time;
                const finalPace = Math.floor(leaderboardData.points[i].value / (timeDifference / 120000));  // Points per minute calculation
                this.finalPaceValues.push(finalPace);
            }
        } catch (error) {
            console.error('Interval data fetch error:', error);
        } finally {
            this.isLoading = false;
        }
    }

    async mounted(): Promise<void> {
        await this.fetchLeaderboardData();
        await this.fetchIntervalData();

        this.differencesCalculated = true;

        this.paceCalculations();
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
        background-color: aliceblue;
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

    .leaderboard-row-container {
        display: flex;
        flex-direction: row;
        gap: 10px;
        margin-bottom: 10px;
    }
    
    .data-box {
        width: 150px;
        height: 70px;
        background-color: rgba(245, 245, 245, 0.4);
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .differential-pts,
    .pts-min {
        color: greenyellow;
        display: flex;
    }

    .differential-pts {
        display: inline-flex;
        align-items: center;
        position: relative;
        cursor: pointer;
    }

    .differential-pts .tooltip-text {
        visibility: hidden;
        background-color: #555;
        color: #fff;
        text-align: center;
        padding: 8px 12px;
        border-radius: 6px;
        white-space: nowrap;
        
        position: absolute;
        left: 100%;
        margin-left: 10px;
        
        display: flex;
        align-items: center;
        justify-content: center;
        
        opacity: 0;
        transition: opacity 0.3s;
        
        width: auto;
        min-width: 40px;
    }

    .differential-pts .tooltip-text::after {
        content: "";
        position: absolute;
        right: 100%;
        border-width: 5px;
        border-style: solid;
        border-color: transparent #555 transparent transparent;
    }

    .differential-pts:hover .tooltip-text {
        visibility: visible;
        opacity: 1;
    }
</style>