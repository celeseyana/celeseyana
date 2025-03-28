<template>
    <div class="ep-container">
        <div class="data-fields">
            <div class="indv-fields">
                <span>Points per song</span>
                <input v-model="pointsPerSong" placeholder="Points per song" class="input-field-ep"/>
            </div>
            
            <div class="indv-fields">
                <span>Current EP</span>
                <input v-model="currentEventPoints" placeholder="Current event points" class="input-field-ep"/>
            </div>
        </div>
        <div id="selector-header">Event Type {{ selected }}</div>
        <select class="evt-selector" v-model="selected">
            <option>Normal</option>
            <option>Challenge Live</option>
            <option>VS Live</option>
            <option>Live Goals</option>
            <option>Mission Live</option>
            <option>Team Live Festival</option>
            <option>Medley Live</option>
        </select>
        <button>Submit</button>
        <!-- needs a separate field if CL -->
    </div>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';

export default class EventPoints extends Vue {
    data() {
        return {
            selected: 'Normal'
        }
    }

    private async standardPointsCalculator() {
        
    }
};
</script>

<style>
    .ep-container {
        position: relative;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 1%;
    }

    .data-fields {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .data-fields input {
        max-height: 1vw;
    }

    .data-fields span {
        text-align: right;
        margin-bottom: 4%;
    }

    .indv-fields {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 10px;
    }

    .input-field-ep {
        margin-left: 0;
        text-align: center;
    }

    #selector-header {
        margin-bottom: 10px;
    }

    .evt-selector {
        margin-bottom: 10px;
    }
</style>