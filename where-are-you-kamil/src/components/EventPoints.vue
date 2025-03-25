<template>
    <div class="ep-container">
        <div class="data-fields">
            <div class="indv-fields">
                <span>Points per song*</span>
                <input v-model="pointsPerSong" placeholder="Points per song" class="input-field-ep"/>
            </div>
            
            <div class="indv-fields">
                <span>Current EP*</span>
                <input v-model="currentEventPoints" placeholder="Current event points" class="input-field-ep"/>
            </div>
        </div>
        <button>Submit</button>
    </div>
</template>

<script>
    export default {
        name: 'EventPoints', 
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
</style>