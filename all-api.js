
/**

外部调用公共api

 **/
/**

coinType:目前支持btc,bch,fch
secretKey:密语
 **/
function generateAdress(coinType, secretKey) {
	if (coinType == 'btc') {

		var value = new buffer.Buffer(secretKey);
		var hash = BitcoreLib.crypto.Hash.sha256(value);
		var bn = BitcoreLib.crypto.BN.fromBuffer(hash);
		var privatekey=new BitcoreLib.PrivateKey(bn);
		var address = privatekey.toAddress().toString();
		return [privatekey.toWIF(),address];
	}

	if (coinType == 'bch') {
		var value = new buffer.Buffer(secretKey);
		var hash = BitcoreLibCash.crypto.Hash.sha256(value);
		var bn = BitcoreLibCash.crypto.BN.fromBuffer(hash);
		var privatekey = new BitcoreLibCash.PrivateKey(bn);
		var address = privatekey.toAddress().toCashAddress();
		return [privatekey.toWIF(),address];
	}

	if (coinType == 'fch') {
		var value = new buffer.Buffer(secretKey);
		var hash = BitcoreLibFreeCash.crypto.Hash.sha256(value);
		var bn = BitcoreLibFreeCash.crypto.BN.fromBuffer(hash);
		var privatekey = new BitcoreLibFreeCash.PrivateKey(bn);
		var address = privatekey.toAddress().toString();
		return [privatekey.toWIF(),address];
	}
}

function importAdressFromWIF(coinType, wif) {
	if (coinType == 'btc') {

		var pk = BitcoreLib.PrivateKey.fromWIF(wif);
		var address = pk.toAddress().toString();
		return address;
	}

	if (coinType == 'bch') {
		var pk = BitcoreLibCash.PrivateKey.fromWIF(wif);
		var address = pk.toAddress().toCashAddress();
		return address
	}

	if (coinType == 'fch') {
		var pk = BitcoreLibFreeCash.PrivateKey.fromWIF(wif);
		var address = pk.toAddress().toString();
		return address;
	}
}
/**

fromCoinType  btc,bch,fch
toCoinType   btc,bch,fch
address 地址
 **/

function addressConvert(toCoinType, address) {
	if (toCoinType == 'btc') {

		return bchaddr.toLegacyAddress(address);
	}
	if (toCoinType == 'bch') {

		return bchaddr.toCashAddress(address);
	}
	if (toCoinType == 'fch') {

		return bchaddr.toFreeCashAddress(address);
	}
}

function signMessage(coinType,privateKey,msg)
{
	var pk=BitcoreMsg.PrivateKey.fromString(privateKey);
	var sigmsg=BitcoreMsg.Message(msg).sign(pk);
	return sigmsg;
}

function messageVerify(coinType,address,msg,sigstr)
{
	
	var addr=addressConvert('btc',address);
	return BitcoreMsg.Message(msg).verify(addr,sigstr)
}

/**

生成交易签名

inputprivatekeys 输入私钥列表

txids  输入utxo的id列表

inputamounts  输入数量

indexs utxo的索引列表

outputaddresses 输出地址列表

outputamounts 输出数量

returnaddr  找零地址

txfee  交易费



 */
function createBchTranscationSig(inputprivatekeys, txids, inputamounts, indexs, outputaddresses, outputamounts, returnaddr, txfee,msg) {
	if (inputprivatekeys.length != txids.length || inputprivatekeys.length != inputamounts.length || inputprivatekeys.length != indexs.length)
		throw "input length not same"
		if (outputaddresses.length != outputamounts.length)
			throw "output length not same"

			var inputlen = inputprivatekeys.length;
	var trans = BitcoreLibCash.Transaction();
	var privatekeys = new Array();
	for (var i = 0; i < inputlen; ++i) {
		var privatekey = BitcoreLibCash.PrivateKey.fromWIF(inputprivatekeys[i]);
		privatekeys[i] = privatekey;
		var publickey = privatekey.toPublicKey();
		var addr = publickey.toAddress();
		var script = BitcoreLibCash.Script.buildPublicKeyHashOut(addr);
		trans = trans.from({
				"txId": txids[i],
				"outputIndex": indexs[i],
				"address": addr.toString(),
				"script": script.toHex(),
				"satoshis": inputamounts[i] * 100000000
			});
	}

	var outputlen = outputaddresses.length;
	for (var i = 0; i < outputlen; ++i) {
		trans = trans.to(addressConvert('bch', outputaddresses[i]), outputamounts[i] * 100000000);
	}
		if(typeof(msg) == 'string' && msg!='')
	{
		var msgScript=BitcoreLibCash.Script.buildDataOut(msg);
		var msgOutput=BitcoreLibCash.Transaction.Output.fromObject(
		{
			 satoshis: 0,
    script: msgScript
		}
		);
		trans.addOutput(msgOutput);
	}
	if(typeof(returnaddr) == 'string' && returnaddr!='')
	  trans = trans.change(addressConvert('bch', returnaddr)).fee(txfee * 100000000).sign(privatekeys);
    else
	  trans=trans.sign(privatekeys);

	return trans.toString();

}

function createBtcTranscationSig(inputprivatekeys, txids, inputamounts, indexs, outputaddresses, outputamounts, returnaddr, txfee,msg) {
	if (inputprivatekeys.length != txids.length || inputprivatekeys.length != inputamounts.length || inputprivatekeys.length != indexs.length)
		throw "input length not same"
		if (outputaddresses.length != outputamounts.length)
			throw "output length not same"

	var inputlen = inputprivatekeys.length;
	var trans = BitcoreLib.Transaction();
	var privatekeys = new Array();
	for (var i = 0; i < inputlen; ++i) {
		var privatekey = BitcoreLib.PrivateKey.fromWIF(inputprivatekeys[i]);
		privatekeys[i] = privatekey;
		var publickey = privatekey.toPublicKey();
		var addr = publickey.toAddress();
		var script = BitcoreLib.Script.buildPublicKeyHashOut(addr);
		trans = trans.from({
				"txId": txids[i],
				"outputIndex": indexs[i],
				"address": addr.toString(),
				"script": script.toHex(),
				"satoshis": inputamounts[i] * 100000000
			});
	}

	var outputlen = outputaddresses.length;
	for (var i = 0; i < outputlen; ++i) {
		trans = trans.to(outputaddresses[i], outputamounts[i] * 100000000);
	}
	
	if(typeof(msg) == 'string' && msg!='')
	{
		var msgScript=BitcoreLib.Script.buildDataOut(msg);
		var msgOutput=BitcoreLib.Transaction.Output.fromObject(
		{
			 satoshis: 0,
    script: msgScript
		}
		);
		trans.addOutput(msgOutput);
	}
	if(typeof(returnaddr) == 'string' && returnaddr!='')
	  trans = trans.change(addressConvert('btc', returnaddr)).fee(txfee * 100000000).sign(privatekeys);
    else
	  trans=trans.sign(privatekeys);

	return trans.toString();

}

function createFchTranscationSig(inputprivatekeys, txids, inputamounts, indexs, outputaddresses, outputamounts, returnaddr, txfee,msg) {
	if (inputprivatekeys.length != txids.length || inputprivatekeys.length != inputamounts.length || inputprivatekeys.length != indexs.length)
		throw "input length not same"
		if (outputaddresses.length != outputamounts.length)
			throw "output length not same"

	var inputlen = inputprivatekeys.length;
	var trans = BitcoreLibFreeCash.Transaction();
	var privatekeys = new Array();
	for (var i = 0; i < inputlen; ++i) {
		var privatekey = BitcoreLibFreeCash.PrivateKey.fromWIF(inputprivatekeys[i]);
		privatekeys[i] = privatekey;
		var publickey = privatekey.toPublicKey();
		var addr = publickey.toAddress();
		var script = BitcoreLibFreeCash.Script.buildPublicKeyHashOut(addr);
		trans = trans.from({
				"txId": txids[i],
				"outputIndex": indexs[i],
				"address": addr.toString(),
				"script": script.toHex(),
				"satoshis": inputamounts[i] * 100000000
			});
	}

	var outputlen = outputaddresses.length;
	for (var i = 0; i < outputlen; ++i) {
		trans = trans.to(addressConvert('fch', outputaddresses[i]), outputamounts[i] * 100000000);
	}
	if(typeof(msg) == 'string' && msg!='')
	{
		var msgScript=BitcoreLibFreeCash.Script.buildDataOut(msg);
		var msgOutput=BitcoreLibFreeCash.Transaction.Output.fromObject(
		{
			 satoshis: 0,
             script: msgScript
		}
		);
		trans.addOutput(msgOutput);
	}
	if(typeof(returnaddr) == 'string' && returnaddr!='')
	  trans = trans.change(addressConvert('fch', returnaddr)).fee(txfee * 100000000).sign(privatekeys);
    else
	  trans=trans.sign(privatekeys);
	return trans.toString();
}
