
/**
	字符串编程utf-8字节
**/
function stringToByte(str) {
			var bytes = new Array();
			var len, c;
			len = str.length;
			for(var i = 0; i < len; i++) {
				c = str.charCodeAt(i);
				if(c >= 0x010000 && c <= 0x10FFFF) {
					bytes.push(((c >> 18) & 0x07) | 0xF0);
					bytes.push(((c >> 12) & 0x3F) | 0x80);
					bytes.push(((c >> 6) & 0x3F) | 0x80);
					bytes.push((c & 0x3F) | 0x80);
				} else if(c >= 0x000800 && c <= 0x00FFFF) {
					bytes.push(((c >> 12) & 0x0F) | 0xE0);
					bytes.push(((c >> 6) & 0x3F) | 0x80);
					bytes.push((c & 0x3F) | 0x80);
				} else if(c >= 0x000080 && c <= 0x0007FF) {
					bytes.push(((c >> 6) & 0x1F) | 0xC0);
					bytes.push((c & 0x3F) | 0x80);
				} else {
					bytes.push(c & 0xFF);
				}
			}
			return bytes;
 
 
		}
	
 
 
		 function byteToString(arr) {
			if(typeof arr === 'string') {
				return arr;
			}
			var str = '',
				_arr = arr;
			for(var i = 0; i < _arr.length; i++) {
				var one = _arr[i].toString(2),
					v = one.match(/^1+?(?=0)/);
				if(v && one.length == 8) {
					var bytesLength = v[0].length;
					var store = _arr[i].toString(2).slice(7 - bytesLength);
					for(var st = 1; st < bytesLength; st++) {
						store += _arr[st + i].toString(2).slice(2);
					}
					str += String.fromCharCode(parseInt(store, 2));
					i += bytesLength - 1;
				} else {
					str += String.fromCharCode(_arr[i]);
				}
			}
			return str;
		 }
		

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  for (var i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}
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

function addressType(addr)
{
	try
	{
	var type=bchaddr.decodeAddress(addr);
	return type.format;
	}catch (error) {
    return 'none';
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
	try{
	var addr=addressConvert('btc',address);
	return BitcoreMsg.Message(msg).verify(addr,sigstr)
	}catch(error)
	{
		return "error"
	}
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

msg 文本或者base64编码的文本

msgtype 1是文本 2是base64文本

 **/
function createBchTranscationSig(inputprivatekeys, txids, inputamounts, indexs, outputaddresses, outputamounts, returnaddr, txfee,msg,msgtype) {
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
				"satoshis": computerSatoshis(inputamounts[i])
			});
	}

	var outputlen = outputaddresses.length;
	for (var i = 0; i < outputlen; ++i) {
		trans = trans.to(addressConvert('bch', outputaddresses[i]), computerSatoshis(outputamounts[i]));
	}
		if(typeof(msg) == 'string' && msg!='')
	{
        var opreturnmsg=null;
		if(msgtype==1)
	    {
			 opreturnmsg=msg;
		}
		if(msgtype==2)
		{
			opreturnmsg=new buffer.Buffer(toByteArray(msg));
		}
		var msgScript=BitcoreLibFreeCash.Script.buildDataOut(opreturnmsg);
		var msgOutput=BitcoreLibFreeCash.Transaction.Output.fromObject(
		{
			 satoshis: 0,
             script: msgScript
		}
		);
		trans.addOutput(msgOutput);
	}
	if(typeof(returnaddr) == 'string' && returnaddr!='')
	  trans = trans.change(addressConvert('bch', returnaddr)).fee(computerSatoshis(txfee)).sign(privatekeys);
    else
	  trans=trans.sign(privatekeys);

	return trans.toString();

}

function computerSatoshis(amount)
{
	var totalinputamount=new BigNumber(amount)
	
	return totalinputamount.times(100000000).toNumber();
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

msg 文本或者base64编码的文本

msgtype 1是文本 2是base64文本

 **/
function createBtcTranscationSig(inputprivatekeys, txids, inputamounts, indexs, outputaddresses, outputamounts, returnaddr, txfee,msg,msgtype) {
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
				"satoshis": computerSatoshis(inputamounts[i])
			});
	}

	var outputlen = outputaddresses.length;
	for (var i = 0; i < outputlen; ++i) {
		trans = trans.to(outputaddresses[i], computerSatoshis(outputamounts[i]));
	}
	
	if(typeof(msg) == 'string' && msg!='')
	{
        var opreturnmsg=null;
		if(msgtype==1)
	    {
			 opreturnmsg=msg;
		}
		if(msgtype==2)
		{
			opreturnmsg=new buffer.Buffer(toByteArray(msg));
		}
		var msgScript=BitcoreLibFreeCash.Script.buildDataOut(opreturnmsg);
		var msgOutput=BitcoreLibFreeCash.Transaction.Output.fromObject(
		{
			 satoshis: 0,
             script: msgScript
		}
		);
		trans.addOutput(msgOutput);
	}
	if(typeof(returnaddr) == 'string' && returnaddr!='')
	  trans = trans.change(addressConvert('btc', returnaddr)).fee(computerSatoshis(txfee)).sign(privatekeys);
    else
	  trans=trans.sign(privatekeys);

	return trans.toString();

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

msg 文本或者base64编码的文本

msgtype 1是文本 2是base64文本

 **/
function createFchTranscationSig(inputprivatekeys, txids, inputamounts, indexs, outputaddresses, outputamounts, returnaddr, txfee,msg,msgtype) {
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
				"satoshis": computerSatoshis(inputamounts[i])
			});
	}

	var outputlen = outputaddresses.length;
	for (var i = 0; i < outputlen; ++i) {
		trans = trans.to(addressConvert('fch', outputaddresses[i]), computerSatoshis(outputamounts[i]));
	}
	if(typeof(msg) == 'string' && msg!='')
	{
        var opreturnmsg=null;
		if(msgtype==1)
	    {
			 opreturnmsg=msg;
		}
		if(msgtype==2)
		{
			opreturnmsg=new buffer.Buffer(toByteArray(msg));
		}
		var msgScript=BitcoreLibFreeCash.Script.buildDataOut(opreturnmsg);
		var msgOutput=BitcoreLibFreeCash.Transaction.Output.fromObject(
		{
			 satoshis: 0,
             script: msgScript
		}
		);
		trans.addOutput(msgOutput);
	}
	
	if(typeof(returnaddr) == 'string' && returnaddr!='')
	  trans = trans.change(addressConvert('fch', returnaddr)).fee(computerSatoshis(txfee)).sign(privatekeys);
    else
	  trans=trans.sign(privatekeys);
	return trans.toString();
}
/**
words 空格分隔  比如:你 好 世 界	
path  btc m/44/0/0/1/2'  m/44/0/145/1/2'
**/
function  mnemonicWord(cointype,words,path)
{
	var code=new Mnemonic(words);
	var hdrootkey=code.toHDPrivateKey();
	var derivedprivatekey=hdrootkey.deriveChild(path);
	var privatekey=derivedprivatekey.privateKey;
	var address = privatekey.toAddress().toString();
	return [privatekey.toWIF(),addressConvert(cointype,address)];
}


//protocol FEIP003

function encodeFEIP003(username,tags,op)
{
	
	var tagslen = tags.length;
	var tagsstr="";
	for (var i = 0; i < tagslen; ++i) {
	
	    var tag=tags[i];
	    if(typeof(tag) == 'string' && tag!='' && tag.indexOf("#")==-1)
		{
			tagsstr=tagsstr+"#"+tag;
		}else
		{
			return "error";
		}
	}
	//create or update
	if(op==1)
	{
	  if(typeof(username) == 'string' && username!='')
	  {
       if(username.indexOf("|")==-1)
       {
		var returnmsg= "FEIP|3|1|"+username+"|"+tagsstr;  
		//check长度
		var bytesstr=stringToByte(returnmsg);
		if(bytesstr.length>210)
		{
			return "1";
			
		}else{
		
		    return returnmsg;
		}
		
	   }
	   else
	   {
		   return "error";
	   }
   
	  }else{
		  return "error";
	}
	}
	if(op==2)
	{
		return "FEIP|3|1||"
	}
}

//protocol FEIP004

function encodeFEIP004(op)
{
	
	
	if(op==1)
	{
		return "FEIP|4|1|equal"
	}
	if(op==2)
	{
		return "FEIP|4|1|replace"
	}
	if(op==3)
	{
		return "FEIP|4|1|backup"
	}
	if(op==4)
	{
		return "FEIP|4|1|combine"
	}
}
