<template>
    <el-container class="p-5">
        <el-header>
            <h2 class="text-center">Interest Rate Guess<el-icon><Flag /></el-icon></h2>
        </el-header>
        <el-main class="flex justify-center">
            <el-card shadow="hover" style="width: 1000px;">
                <el-form label-width="100px" class="pt-5">
                    <el-row class="justify-center">
                        <el-col :span="12">
                            <el-form-item label="People Bet:" inline>
                                <el-text class="pl-2">{{ appStore.dapp.info.totalParticipants }}</el-text>
                            </el-form-item>
                            <el-form-item label="Betting Pool:" >
                                <el-text class="pl-2">{{ appStore.dapp.info.totalAmount }}</el-text>
                            </el-form-item>
                            <el-form-item label="You can get:" >
                                <el-text class="pl-2">{{ appStore.dapp.info.reward }}</el-text>
                            </el-form-item>
                            <el-form-item label="BetDeadline:" >
                                <el-text class="pl-2">{{ timeFormat(appStore.dapp.info.deadline, 'yyyy-mm-dd hh:MM:ss') }}</el-text>
                            </el-form-item>
                        </el-col>

                        <el-col :span="12">
                            <el-form-item label="WinnerNum:" >
                                <el-text class="pl-2">{{ appStore.dapp.info.winnerCount }}</el-text>
                            </el-form-item>
                            <el-form-item label="Actual Rate:" >
                                <el-text class="pl-2">{{ appStore.dapp.info.actualRate }}</el-text>
                            </el-form-item>
                            <el-form-item label="If Revealed:">
                                <el-text class="pl-2">{{ appStore.dapp.info.rateRevealed }}</el-text>
                            </el-form-item>
                            <el-form-item label="Fed Reveal:" >
                                <el-text class="pl-2">{{ timeFormat(appStore.dapp.info.revealRateDate, 'yyyy-mm-dd hh:MM:ss') }}</el-text>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-divider border-style="dashed" />

                    <el-form-item label="Account:">
                        <el-input v-model="appStore.address" readonly />
                    </el-form-item>
                    <el-form-item label="Balance:">
                        <el-input v-model="appStore.balance" readonly />
                    </el-form-item>

                    <el-form-item label="">
                        <el-text type="primary" size="large">
                            How many basis points do you think the Fed will raise rates next month?
                        </el-text>
                    </el-form-item>
                    <el-form-item label="Your choice:">
                        <el-select v-model="data.choice" placeholder="please select your choice">
                            <el-option label="0" value="0" />
                            <el-option label="25bp" value="1" />
                            <el-option label="50bp" value="2" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Your Bets:">
                        <el-input-number v-model="data.bets" :min="1" :max="parseFloat(appStore.balance)"/>
                        <el-text class="pl-2">ETH</el-text>
                    </el-form-item>
                </el-form>
            </el-card>
        </el-main>
        <el-footer>
            <el-row class="justify-center">
                <el-tooltip
                    class="box-item"
                    effect="dark"
                    content="Click to start betting"
                    placement="top-start"
                >
                    <el-button type="success" class="w-28" @click="appStore.predict(data.choice, data.bets)">Bet</el-button>
                </el-tooltip>

                <el-tooltip
                    class="box-item"
                    effect="dark"
                    content="Click to cancel bet"
                    placement="top-start"
                >
                    <el-button type="primary" class="w-28" @click="appStore.cancelPrediction">Cancel</el-button>
                </el-tooltip>

                <el-tooltip
                    class="box-item"
                    effect="dark"
                    content="Owner public interest rate increase"
                    placement="top-start"
                >
                    <el-button type="danger" class="w-28" @click="revealRate">Reveal Rate</el-button>
                </el-tooltip>

                <el-tooltip
                    class="box-item"
                    effect="dark"
                    content="Click to receive my rewards"
                    placement="top-start"
                >
                    <el-button type="warning" class="w-28" @click="appStore.claimReward">Receive award</el-button>
                </el-tooltip>
            </el-row>
        </el-footer>
    </el-container>
</template>
<script setup>
import { onMounted, onBeforeUnmount, reactive } from 'vue'
import useAppStore from '@/store/modules/app'
import { timeFormat } from '@/utils/tool'

const appStore = useAppStore()

// form data
const data = reactive({
    choice: 0,
    bets: 1,
})

// reveal interest rate
const revealRate = async () => {
    ElMessageBox.prompt('Please input index 0 or 1 or 2', 'Tip', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        inputPattern: /^[012]$/,
        inputErrorMessage: 'Invalid index',
    })
    .then(async ({ value }) => {
        await appStore.revealRate(value)
    })
}

// life cycle
onMounted(async () => {
    // Delay 500 milliseconds for the page metamask to finish loading
    setTimeout(async () => {
        await appStore.dappInit()
    }, 500)
})
onBeforeUnmount(() => {
    // Cancel Event Listening
    appStore.cancelEvents()
})
</script>