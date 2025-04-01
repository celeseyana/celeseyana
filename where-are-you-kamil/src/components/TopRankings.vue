<template>
    <div class="loader-container" v-if="isLoading">
        <div class="loader"></div>
    </div>
    <div class="has-text-centered interval-data">
        <span class="is-size-9">
            Interval data fetched @ {{ snapshotTime }} GMT+8
        </span>
    </div>
    <div class="box t10-container has-background-dark has-text-white" v-if="!isLoading">
        <div class="columns is-multiline">
            <div class="column is-half">
                <div v-for="(player, index) in players.slice(0, 5)" :key="player.uid" class="leaderboard-row mb-4">
                    <article class="media">
                        <div class="media-left">
                            <div class="event-rank">
                                <img v-if="index < 3" :src="'/en_' + (index + 1) + '.png'" width="40" />
                                <span v-else class="tag is-medium is-dark">#{{ index + 1 }}</span>
                            </div>
                        </div>
                        
                        <div class="media-left player-icon">
                            <figure class="image is-48x48">
                                <img class="is-rounded" :src="player.iconUrl || getFallbackIconUrl()" alt="User icon">
                            </figure>
                        </div>
                        
                        <div class="media-content">
                            <div class="content">
                                <p class="mb-1 has-text-white">
                                    <strong v-html="formatText(player.name)"></strong>
                                </p>
                                <p class="is-size-7 has-text-light" v-html="formatText(player.introduction)"></p>
                            </div>
                        </div>
                        
                        <div class="media-right player-stuff">
                            <div class="tags has-addons player-rank">
                                <span class="tag is-dark">Rank</span>
                                <span class="tag is-info">{{ player.rank }}</span>
                            </div>
                            <div class="mt-2">
                                <span class="tag is-success">
                                    {{ player.points.toLocaleString() }} pts
                                </span>
                            </div>
                            <div v-if="differencesCalculated && differences.length > index" class="mt-2">
                                <span class="tag is-warning">
                                    +{{ differences[index].toLocaleString() }}
                                </span>
                            </div>
                            <div v-if="finalPaceValues.length > index" class="mt-2">
                                <span class="tag is-primary">
                                    +{{ finalPaceValues[index].toLocaleString() }} pts/min
                                </span>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
            
            <div class="column is-half">
                <div v-for="(player, index) in players.slice(5, 10)" :key="player.uid" class="leaderboard-row mb-4">
                    <article class="media">
                        <div class="media-left">
                            <span class="tag is-medium is-dark">#{{ index + 6 }}</span>
                        </div>
                        
                        <div class="media-left player-icon">
                            <figure class="image is-48x48">
                                <img class="is-rounded" :src="player.iconUrl || getFallbackIconUrl()" alt="User icon">
                            </figure>
                        </div>
                        
                        <div class="media-content">
                            <div class="content">
                                <p class="mb-1 has-text-white">
                                    <strong v-html="formatText(player.name)"></strong>
                                </p>
                                <p class="is-size-7 has-text-light" v-html="formatText(player.introduction)"></p>
                            </div>
                        </div>
                        
                        <div class="media-right player-stuff">
                            <div class="tags has-addons player-rank">
                                <span class="tag is-dark">Rank</span>
                                <span class="tag is-info">{{ player.rank }}</span>
                            </div>
                            <div class="mt-2">
                                <span class="tag is-success">
                                    {{ player.points.toLocaleString() }} pts
                                </span>
                            </div>
                            <div v-if="differencesCalculated && differences.length > (index + 5)" class="mt-2">
                                <span class="tag is-warning">
                                    +{{ differences[index + 5].toLocaleString() }}
                                </span>
                            </div>
                            <div v-if="finalPaceValues.length > (index + 5)" class="mt-2">
                                <span class="tag is-primary">
                                    +{{ finalPaceValues[index + 5].toLocaleString() }} pts/min
                                </span>
                            </div>
                        </div>
                    </article>
                </div>
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
                const finalPace = Math.floor(leaderboardData.points[i].value / (timeDifference / 60000));
                this.finalPaceValues.push(finalPace);
            }
        } catch (error) {
            console.error('Interval data fetch error:', error);
        }
    }

    async mounted(): Promise<void> {
        this.isLoading = true;
        
        try {
            await Promise.all([
                this.fetchLeaderboardData(),
                this.fetchIntervalData(),
                this.paceCalculations()
            ]);

            this.differencesCalculated = true;
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            this.isLoading = false;
        }
    }
}
</script>

<style>
    .loader-container {
        position: fixed;
        display: flex;
        width: 100%;
        height: 100%;
        align-items: center;
        justify-content: center;
    }

    .loader {
        width: 50px;
        aspect-ratio: 1;
        display: grid;
    }

    .loader::before,
    .loader::after {    
        content:"";
        grid-area: 1/1;
        --c:no-repeat radial-gradient(farthest-side,#25b09b 92%,#0000);
        background: 
            var(--c) 50%  0, 
            var(--c) 50%  100%, 
            var(--c) 100% 50%, 
            var(--c) 0    50%;
        background-size: 12px 12px;
        animation: l12 1s infinite;
    }

    .loader::before {
        margin: 4px;
        filter: hue-rotate(45deg);
        background-size: 8px 8px;
        animation-timing-function: linear
    }

    @keyframes l12 { 
        100%{transform: rotate(.5turn)}
    }

    .interval-data {
        justify-content: center;
        align-items: center;
        padding: 8px;
    }

    .t10-container {
        display: flex;
        position: relative;
        width: 100%;
        height: fit-content;
        align-items: center;
        justify-content: center;
        color: white;
    }

    .box {
        background-color: rgba(20, 22, 26, 0.75) !important;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .media {
        padding: 25px;
    }
    
    .leaderboard-row {
        border: 1px solid rgba(255, 255, 255, 0.25);
        border-radius: 25px;
        padding-bottom: 0;
    }
    
    .event-rank img {
        height: 40px;
        object-fit: contain;
    }

    .player-rank {
        display: flex;
        justify-content: flex-end;
    }
    
    .media-content {
        overflow: hidden;
    }
    
    .media-right {
        text-align: right;
        min-width: 120px;
    }

    @media (max-width: 520px) {
        .media {
            display: flex;
            flex-direction: column;
        }

        .player-stuff {
            margin-top: 15px;
        }

        .player-icon {
            margin-top: 15px;
            margin-bottom: 15px;
        }
    }
</style>