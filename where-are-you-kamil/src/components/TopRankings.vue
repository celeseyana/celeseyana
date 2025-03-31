<template>
    <div class="t10-leaderboard-container">
        <div class="leaderboard-columns">
            <div class="leaderboard-column">
                <div v-for="(player, index) in players.slice(0, 5)" :key="player.uid" class="leaderboard-row-container">
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
                            <span class="userPts">{{ player.points.toLocaleString() }} pts</span>
                            <span class="differential-pts"
                                v-if="differencesCalculated && differences.length > index && differences[index] !== undefined">
                                +{{ differences[index].toLocaleString() }}
                            </span>
                            <span v-if="finalPaceValues.length > 0 && finalPaceValues[index] !== undefined" class="pts-min">
                                +{{ finalPaceValues[index].toLocaleString() }} pts/min.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="leaderboard-column">
                <div v-for="(player, index) in players.slice(5, 10)" :key="player.uid" class="leaderboard-row-container">
                    <div class="leaderboard-row" :id="'rank-' + (index + 6)">
                        <div class="event-rank">
                            <span>#{{ index + 6 }}</span>
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
                            <span class="userPts">{{ player.points.toLocaleString() }} pts</span>
                            <span class="differential-pts"
                                v-if="differencesCalculated && differences.length > (index + 5) && differences[index + 5] !== undefined">
                                +{{ differences[index + 5].toLocaleString() }}
                            </span>
                            <span v-if="finalPaceValues.length > 0 && finalPaceValues[index] !== undefined" class="pts-min">
                                +{{ finalPaceValues[index + 5].toLocaleString() }} pts/min.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="data-last-snapshot-text">
            <span>Interval data fetched @ {{ snapshotTime }} GMT+8</span>
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
                const finalPace = Math.floor(leaderboardData.points[i].value / (timeDifference / 60000));
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
    .t10-leaderboard-container {
        display: flex;
        position: relative;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding: 20px;
        box-sizing: border-box;
    }

    .leaderboard-columns {
        display: flex;
        gap: 10px;
        justify-content: center;
    }

    .leaderboard-column {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .leaderboard-row {
        width: 600px;
        height: 100px;
        background-color: rgba(245, 245, 245, 0.4);
        border-radius: 10px;
        display: flex;
        align-items: center;
        padding: 0 15px;
        box-sizing: border-box;
    }

    .event-rank {
        width: 60px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-shrink: 0;
    }

    .event-rank img {
        width: 40px;
        height: 20px;
    }

    .user-icon {
        width: 50px;
        height: 50px;
        border-radius: 10px;
        background-color: aliceblue;
        flex-shrink: 0;
        overflow: hidden;
        margin-left: 4%;
    }

    .user-icon img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .user-name-desc {
        display: flex;
        flex-direction: column;
        margin-left: 4%;
        overflow: hidden;
    }

    .user-rank-id-pts {
        margin-left: auto;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        padding-right: 15px;
        min-width: 120px;
    }

    .username,
    .userDesc {
        line-height: 1.3;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .username {
        font-weight: bold;
        margin-bottom: 2px;
    }

    .userDesc {
        font-size: 0.9em;
        opacity: 0.8;
    }

    .userRank {
        font-size: 0.9em;
        margin-bottom: 2px;
    }

    .userPts {
        font-weight: bold;
    }

    .pts-min {
        color: rgb(173, 255, 173);
    }

    .differential-pts {
        color: greenyellow;
        font-size: 0.9em;
        display: inline-flex;
        align-items: center;
        position: relative;
        cursor: pointer;
    }

    .data-last-snapshot-text {
        background-color: rgba(245, 245, 245, 0.4);
        margin-top: 1%;
        display: flex;
        flex-direction: row;
        align-items: flex-start;
    }

    .data-last-snapshot-text span {
        margin: 5px;
    }

    @media (max-width: 1400px) {
        .t10-leaderboard-container {
            justify-content: center;
            align-items: center;
            padding: 14px;
        }
        
        .leaderboard-columns {
            gap: 7px;
        }
        
        .leaderboard-row {
            width: 420px;
            height: 70px;
            padding: 7px;
            border-radius: 7px;
        }
        
        .event-rank {
            width: 42px;
        }
        
        .event-rank img {
            width: 28px;
            height: 14px;
        }
        
        .user-icon {
            width: 35px;
            height: 35px;
            margin-left: 3%;
        }
        
        .user-name-desc {
            margin-left: 3%;
        }
        
        .username {
            font-size: 0.85em;
            margin-bottom: 1px;
        }
        
        .userDesc,
        .userRank,
        .differential-pts {
            font-size: 0.8em;
        }
        
        .user-rank-id-pts {
            padding-right: 10px;
            min-width: 84px;
        }
        
        .data-last-snapshot-text span {
            font-size: 0.8em;
            margin: 3px;
        }
    }

    @media (max-width: 1100px) {
        .leaderboard-row {
            width: 95%;
            max-width: 420px;
            height: 60px;
            padding: 5px;
            font-size: small;
        }
        
        .leaderboard-columns {
            gap: 6px;
        }

        .event-rank {
            width: 44px;
        }
        
        .event-rank img {
            width: 30px;
            height: 18px;
        }
        
        .user-icon {
            width: 40px;
            height: 40px;
        }
        
        .user-rank-id-pts {
            min-width: 100px;
        }

        .user-rank-id-pts span {
            font-size: 0.9em;
        }
    }

    @media (max-width: 900px) {
        .t10-leaderboard-container {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            padding: 10px;
            margin-top: 60px;
        }

        .leaderboard-row {
            width: 95%;
            max-width: 280px;
            min-height: 60px;
            padding: 8px;
            font-size: small;
        }
        
        .leaderboard-columns {
            flex-direction: column;
            gap: 10px;
            position: relative;
            margin-top: 0;
        }

        .event-rank {
            width: 30px;
        }
        
        .event-rank img {
            width: 30px;
            height: 18px;
        }
        
        .user-icon {
            width: 30px;
            height: 30px;
        }
        
        .user-rank-id-pts {
            min-width: 80px;
        }

        .user-rank-id-pts span {
            font-size: 0.8em;
        }
    }
</style>