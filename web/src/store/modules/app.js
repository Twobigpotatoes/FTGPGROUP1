import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import Web3 from 'web3'
import InterestRatePrediction from '@/contracts/InterestRatePrediction.json'

const useAppStore = defineStore('app', () => {

    // wallet information
    const address = ref('')
    const balance = ref(0)

    // web3/contract
    const dapp = reactive({
        web3: null,
        instance: null,
        loading: null,
        eventPredict: null,
        eventCancelPrediction: null,
        eventRevealRate: null,
        eventClaimReward: null,
        info: {
            // People Bet
            totalParticipants: 0,
            // BetDeadline
            deadline: '',
            // Fed Reveal
            revealRateDate: '',
            // Fed Reveal
            totalAmount: 0,
            // WinnerNum
            winnerCount: 0,
            // Actual Rate
            actualRate: '',
            // If Revealed
            rateRevealed: '',
            // You can get
            reward: 0,
        }
    })

    // Wallet initialization
    const dappInit = async () => {
        try {
            // check environment
            if (typeof window.ethereum == 'undefined') {
                throw { code: -1, message: "Please install metamask or open in dapp environment" }
            }

            // Listening to wallet switching
            window.ethereum.on('accountsChanged', () => {
                window.location.reload();
            })
            // Listening to internet switching
            window.ethereum.on('chainChanged', () => {
                window.location.reload()
            })

            // Check if the wallet is unlocked
            window.ethereum._metamask.isUnlocked().then((res) => {
                if (!res) throw { code: -1, message: "Please unlock your wallet" }
            })
            // Check connection
            if (window.ethereum.chainId !== 1337 && window.ethereum.networkVersion !== '1337') {
                throw { code: -1, message: "Please switch to Localhost:8575" }
            }

            // get wallet address
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
            address.value = accounts[0]
            
            // intialize web3
            dapp.web3 = new Web3(Web3.givenProvider)
            // Instantiated Contracts
            dapp.instance = new dapp.web3.eth.Contract(InterestRatePrediction.abi, InterestRatePrediction.networks[1337].address)

            // check wallet balance
            await getBalance()
            // Query aggregated statistics
            await getRollupInfo()
            // Query you can get
            await getReward()
            // listen events
            await getEvents()

        } catch (error) {
            if (error.code == 4001) error.message = "User refused to connecting wallet"
            if (error.code == -32002) error.message = "Requests are already waiting to be processed, please be patient"
            notice(`Initialization failure：${error.message}`, false)
        }
    }

    // listen event
    const getEvents = async () => {
        // listen bet event
        dapp.eventPredict = await dapp.instance.events.eventPredict({}, (error, event) => {
            console.log(event);
            dapp.loading.close()
            notice(`Bet successfully, transaction hash:${event.transactionHash}`, true)
            getRollupInfo()
        })

        // listen cancel event
        dapp.eventCancelPrediction = await dapp.instance.events.eventCancelPrediction({}, (error, event) => {
            dapp.loading.close()
            notice(`Cancel successfully, transaction hash:${event.transactionHash}`, true)
            getRollupInfo()
            getBalance()
        })

        // listen to reveal
        dapp.eventRevealRate = await dapp.instance.events.eventRevealRate({}, (error, event) => {
            dapp.loading.close()
            notice(`Revealed successfully, transaction hash:${event.transactionHash}`, true)
            getRollupInfo()
            getReward()
        })

        // listen to receiveaward
        dapp.eventClaimReward = await dapp.instance.events.eventClaimReward({}, (error, event) => {
            dapp.loading.close()
            notice(`Received successfully，Transaction hash:${event.transactionHash}`, true)
            getRollupInfo()
            getBalance()
            getReward()
        })
    }

    // cancel listening
    const cancelEvents = async () => {
        await dapp.eventPredict.unsubscribe();
        await dapp.eventCancelPrediction.unsubscribe();
        await dapp.eventRevealRate.unsubscribe();
        await dapp.eventClaimReward.unsubscribe();
    }

    // Top right corner tip
    const notice = (message, type) => {
        ElNotification({
            title: type ? 'Success' : 'Error',
            message,
            type: type ? 'success' : 'error',
        })
    }

    // loading
    const openLoading = (message) => {
        dapp.loading = ElLoading.service({
            lock: true,
            text: 'Loading',
            background: 'rgba(0, 0, 0, 0.8)',
        })
    }

    // check wallet and balance
    const getBalance = async () => {
        try {
            const res = await ethereum.request({
                method: 'eth_getBalance',
                params: [address.value, 'latest'],
            })
            balance.value = dapp.web3.utils.fromWei(res, 'ether') + ' ETH'

        } catch (error) {}
    }

    // bet
    const predict = async (choice, value) => {
        try {
            openLoading()
            await dapp.instance.methods.predict(choice).send({
                from: address.value,
                value: dapp.web3.utils.toWei(value.toString(), 'ether'),
            })
        } catch (error) {
            dapp.loading.close()
            notice(`Failure：${error.message}`, false)
        }
    }

    // cancel bet
    const cancelPrediction = async (choice, value) => {
        try {
            openLoading()
            await dapp.instance.methods.cancelPrediction().send({
                from: address.value,
            })
        } catch (error) {
            dapp.loading.close()
            notice(`Failure：${error.message}`, false)
        }
    }

    // admin reveal
    const revealRate = async (choice) => {
        try {
            openLoading()
            await dapp.instance.methods.revealRate(choice).send({
                from: address.value,
            })
        } catch (error) {
            dapp.loading.close()
            notice(`Failure：${error.message}`, false)
        }
    }

    // receive award
    const claimReward = async () => {
        try {
            openLoading()
            await dapp.instance.methods.claimReward().send({
                from: address.value,
            })
        } catch (error) {
            dapp.loading.close()
            notice(`Failure：${error.message}`, false)
        }
    }

    // Get aggregated statistics
    const getRollupInfo = async () => {
        try {
            const res = await dapp.instance.methods.getRollupInfo().call()
            dapp.info.totalParticipants = res[0]  
            dapp.info.deadline = res[1]
            dapp.info.revealRateDate = res[2]
            dapp.info.totalAmount = dapp.web3.utils.fromWei(res[3], 'ether') + ' ETH'
            dapp.info.winnerCount = res[4] 
            dapp.info.actualRate = res[6] ? res[5] + ' bp' : 'Unknown'
            dapp.info.rateRevealed = res[6] ? 'Yes' : 'No'
        } catch (error) {}
    }

    // Get the number of rewards you can receive
    const getReward = async () => {
        try {
            const res = await dapp.instance.methods.getReward().call({
                from: address.value,
            })
            dapp.info.reward = dapp.web3.utils.fromWei(res, 'ether') + ' ETH'
        } catch (error) {}
    }

    return {
        dapp,
        address,
        balance,
        dappInit,
        cancelEvents,
        predict,
        cancelPrediction,
        getRollupInfo,
        getReward,
        revealRate,
        claimReward,
    }
}, {
    persist: true
})

export default useAppStore