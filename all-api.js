

/**
	时间格式化
**/
Date.prototype.formatDate = function(fmt){
  var o = {
    "M+" : this.getMonth()+1,                 //月份
    "d+" : this.getDate(),                    //日
    "h+" : this.getHours(),                   //小时
    "m+" : this.getMinutes(),                 //分
    "s+" : this.getSeconds(),                 //秒
    "q+" : Math.floor((this.getMonth()+3)/3), //季度
    "S"  : this.getMilliseconds()             //毫秒
  };

  if(/(y+)/.test(fmt)){
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
  }
        
  for(var k in o){
    if(new RegExp("("+ k +")").test(fmt)){
      fmt = fmt.replace(
        RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));  
    }       
  }

  return fmt;
}


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

function base64ArrayBuffer(arrayBuffer) {
  var base64    = ''
  var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

  var bytes         = new Uint8Array(arrayBuffer)
  var byteLength    = bytes.byteLength
  var byteRemainder = byteLength % 3
  var mainLength    = byteLength - byteRemainder

  var a, b, c, d
  var chunk

  // Main loop deals with bytes in chunks of 3
  for (var i = 0; i < mainLength; i = i + 3) {
    // Combine the three bytes into a single integer
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

    // Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048)   >> 12 // 258048   = (2^6 - 1) << 12
    c = (chunk & 4032)     >>  6 // 4032     = (2^6 - 1) << 6
    d = chunk & 63               // 63       = 2^6 - 1

    // Convert the raw binary segments to the appropriate ASCII encoding
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
  }

  // Deal with the remaining bytes and padding
  if (byteRemainder == 1) {
    chunk = bytes[mainLength]

    a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

    // Set the 4 least significant bits to zero
    b = (chunk & 3)   << 4 // 3   = 2^2 - 1

    base64 += encodings[a] + encodings[b] + '=='
  } else if (byteRemainder == 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

    a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008)  >>  4 // 1008  = (2^6 - 1) << 4

    // Set the 2 least significant bits to zero
    c = (chunk & 15)    <<  2 // 15    = 2^4 - 1

    base64 += encodings[a] + encodings[b] + encodings[c] + '='
  }
  
  return base64
}
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

function getPublickKeyFromWIF(coinType, wif) {
	
		var pk = BitcoreLibFreeCash.PrivateKey.fromWIF(wif);
		var address = pk.toPublicKey().toBuffer();
		return address.toString("hex");
	
}
function getPublicKeyFromHex(coinType, hexStr) {
	var pkbuf=BitcoreLibFreeCash.encoding.Base58Check.decode(base58pk);
	if (coinType == 'btc') {

		var pk = new BitcoreLib.PublicKey.fromString(hexStr,'hex');
		var address = pk.toAddress().toString();
		return address;
	}

	if (coinType == 'bch') {
		var pk = new BitcoreLibCash.PublicKey(pkbuf);
		var address = pk.toAddress().toCashAddress();
		return address
	}

	if (coinType == 'fch') {
		var pk = new BitcoreLibFreeCash.PublicKey(pkbuf);
		var address = pk.toAddress().toString();
		return address;
	}
	
}

function getPublickKeyAddress(coinType, base58pk) {
	var pkbuf=BitcoreLibFreeCash.encoding.Base58Check.decode(base58pk);
	if (coinType == 'btc') {

		var pk = new BitcoreLib.PublicKey(pkbuf);
		var address = pk.toAddress().toString();
		return address;
	}

	if (coinType == 'bch') {
		var pk = new BitcoreLibCash.PublicKey(pkbuf);
		var address = pk.toAddress().toCashAddress();
		return address
	}

	if (coinType == 'fch') {
		var pk = new BitcoreLibFreeCash.PublicKey(pkbuf);
		var address = pk.toAddress().toString();
		return address;
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
	return BitcoreMsg.Message(msg).verify(addr,sigstr);
	}catch(error)
	{
		return "error"
	}
}

function signFullMessage(coinType,privateKey,msg)
{
	var pk=BitcoreMsg.PrivateKey.fromString(privateKey);
	
	var address = pk.toAddress().toString();
	
	var newAddress=addressConvert(coinType,address);
	
	var signmsg=signMessage(coinType,privateKey,msg);
	
	return msg+"----"+newAddress+"----"+signmsg;
}

function verifyFullMessage(coinType,fullmsg)
{
	var datas=fullmsg.split("----");
	
    if(datas==null || datas.length!=3)
		throw "invalid data";
	
	return messageVerify(coinType,datas[1],datas[0],datas[2]);
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
	单位是s
**/
function calcMinTranscationFee(coinType,inputprivatekeys, txids, inputamounts, indexs, outputaddresses, outputamounts, returnaddr,msg,msgtype) {

if(coinType=='bch')
{
	var sig=createBchTranscationSig(inputprivatekeys, txids, inputamounts, indexs, outputaddresses, outputamounts, returnaddr,"0.00000001",msg,msgtype);
	return sig.length/2;
}
if(coinType=='btc')
{
	var sig=createBtcTranscationSig(inputprivatekeys, txids, inputamounts, indexs, outputaddresses, outputamounts, returnaddr,"0.00000001",msg,msgtype);
	return sig.length/2;
}
if(coinType=='fch')
{
	var sig=createFchTranscationSig(inputprivatekeys, txids, inputamounts, indexs, outputaddresses, outputamounts, returnaddr,"0.00000001",msg,msgtype);
	return sig.length/2;
}

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

function encryptData(data,publicKey)
{
	var rndPK=new BitcoreLib.PrivateKey();
	var pkbuf=BitcoreLibFreeCash.encoding.Base58Check.decode(publicKey);
	var publickey=new BitcoreLib.PublicKey(pkbuf);
	var ecies=new BitcoreEcies().privateKey(rndPK).publicKey(publickey);
	var result=ecies.encrypt(data);
	//return result;
	return base64ArrayBuffer(result);
}

function encryptDataByPubkeyHex(data,publicKey)
{
	var rndPK=new BitcoreLib.PrivateKey();;
	var publickey=new BitcoreLib.PublicKey.fromString(publicKey,'hex');
	var ecies=new BitcoreEcies().privateKey(rndPK).publicKey(publickey);
	var result=ecies.encrypt(data);
	//return result;
	return base64ArrayBuffer(result);
}

function encryptBase64DataByPubkeyHex(data,publicKey)
{
	var rndPK=new BitcoreLib.PrivateKey();;
	var publickey=new BitcoreLib.PublicKey.fromString(publicKey,'hex');
	var ecies=new BitcoreEcies().privateKey(rndPK).publicKey(publickey);
	var result=ecies.encrypt(new buffer.Buffer(toByteArray(data)));
	//return result;
	return base64ArrayBuffer(result);
}

function decryptData(data,pkWIF)
{
	var bdata=toByteArray(data);
	var rawBuffer=new buffer.Buffer(bdata);
	var privateKey=BitcoreLib.PrivateKey.fromWIF(pkWIF);
	var result=new BitcoreEcies().privateKey(privateKey).decrypt(rawBuffer);
	return result.toString();
}


//protocol FEIP003

function encodeFEIP003(username,tags,op,recmdname)
{
	
	var tagslen = tags.length;
	var tagsstr="";
	for (var i = 0; i < tagslen; ++i) {
	
	    var tag=tags[i];
	    if(typeof(tag) == 'string' && tag!='' && tag.indexOf("#")==-1)
		{
	        var tagstr=stringToByte(tag);
			if(tagstr.length>16)
		    {
			  throw "input is too long";
		    }
			tagsstr=tagsstr+"#"+tag;
		}else
		{
			throw "input contain illegal character | or #";
		}
	}
	//create or update
	if(op==1 || op==3)
	{
	  if(typeof(username) == 'string' && username!='')
	  {
       var usernamebytesstr=stringToByte(username);
	   if(usernamebytesstr.length>32)
	   {
		   throw "input is too long";
	   }
       if(username.indexOf("|")==-1)
       {
		var returnmsg= "FEIP|3|1|"+username+"|"+tagsstr;  
		//check长度
		if(recmdname!="" && recmdname.indexOf("|")>-1)
		{
			throw "input contain illegal character | or #";
		}
		if(recmdname!="")
		{
	    var rusernamebytesstr=stringToByte(recmdname);
	     if(rusernamebytesstr.length>48)
	     {
		   throw "input is too long";
	      }
			returnmsg=returnmsg+"|"+recmdname;
		}
		else
		{
			returnmsg=returnmsg+"|";
		}
		var bytesstr=stringToByte(returnmsg);
		if(bytesstr.length>210)
		{
			 throw "input is too long";
			
		}else{
		
		    return returnmsg;
		}
		
	   }
	   else
	   {
		  throw "input is too long";
	   }
   
	  }else{
		 throw "input is too long";
	}
	}
	if(op==2)
	{
		return "FEIP|3|1|||"
	}
}

//protocol FEIP004
//op 1 等同  2 联合,3主从
//range 是个列表,1,链上留言 2 属性声明 3 声明认证 4 贡献填报
//stime date类型
//etime date类型
function encodeFEIP004V2(op,stime,etime,range)
{   
	var stimestr=''
	if (stime !== null && stime !== undefined && stime !== '') 
	{
        var offset_time=stime.getTimezoneOffset();
		var curtime=stime.getTime()
		var nsdate=new Date(curtime+offset_time*60*1000);
		stimestr=nsdate.formatDate("yyyyMMddhhmmss")
	}
	var etimestr=''
	if (etime !== null && etime !== undefined && etime !== '') 
	{
        var offset_time=etime.getTimezoneOffset();
		var curtime=etime.getTime()
		var nsdate=new Date(curtime+offset_time*60*1000);
		etimestr=nsdate.formatDate("yyyyMMddhhmmss")
	}
	var rangelen=range.length;
	var rangestr='';
	for(var i=0;i<rangelen;++i)
	{
		if(range[i]==1)
		{
			rangestr=rangestr+'#FEIP7V2';
		}
		if(range[i]==2)
		{
			rangestr=rangestr+'#FEIP8V2';
		}
		if(range[i]==3)
		{
			rangestr=rangestr+'#FEIP9V2';
		}
		if(range[i]==4)
		{
			rangestr=rangestr+'#FOCP1V2';
		}
		
		
	}
	if(op==1)
	{
		return "FEIP|4|2|equal|"+stimestr+"|"+etimestr+"|"+rangestr;
	}
	if(op==2)
	{
		return "FEIP|4|2|combine|"+stimestr+"|"+etimestr+"|"+rangestr;
	}
	if(op==3)
	{
		return "FEIP|4|2|master|"+stimestr+"|"+etimestr+"|"+rangestr;
	}
}

//protocol FEIP004
//op 1 授权  2 解除授权
//range 是个列表,1,链上留言 2 属性声明 3 声明认证 4 贡献填报
//stime date类型
//etime date类型
function encodeFEIP006V2(op,stime,etime,range)
{   
	var stimestr=''
	if (stime !== null && stime !== undefined && stime !== '') 
	{
        var offset_time=stime.getTimezoneOffset();
		var curtime=stime.getTime()
		var nsdate=new Date(curtime+offset_time*60*1000);
		stimestr=nsdate.formatDate("yyyyMMddhhmmss")
	}
	var etimestr=''
	if (etime !== null && etime !== undefined && etime !== '') 
	{
        var offset_time=etime.getTimezoneOffset();
		var curtime=etime.getTime()
		var nsdate=new Date(curtime+offset_time*60*1000);
		etimestr=nsdate.formatDate("yyyyMMddhhmmss")
	}
	var rangelen=range.length;
	var rangestr='';
	for(var i=0;i<rangelen;++i)
	{
		if(range[i]==1)
		{
			rangestr=rangestr+'#FEIP7';
		}
		if(range[i]==2)
		{
			rangestr=rangestr+'#FEIP8';
		}
		if(range[i]==3)
		{
			rangestr=rangestr+'#FEIP9';
		}
		if(range[i]==4)
		{
			rangestr=rangestr+'#FOCP1';
		}
		if(range[i]==5)
		{
			rangestr=rangestr+'#FOCP3';
		}
		
	}
	if(op==1)
	{
		return "FEIP|6|2|authorition|"+stimestr+"|"+etimestr+"|"+rangestr;
	}
	if(op==2)
	{
		return "FEIP|6|2|deprivation|"+stimestr+"|"+etimestr+"|"+rangestr;
	}
	if(op==3)
	{
		return "FEIP|6|2|irrevocable_authorition|||";
	}
	
}

//protocol FEIP11V1
//op 1 申请参与  2 销毁币天 3 发放币天


function encodeFEIP11V2(op)
{   
	
	if(op==1)
	{
		return "FEIP|11|1|apply";
	}
	if(op==2)
	{
		return "FEIP|11|1|destroy";
	}
	if(op==3)
	{
		return "FEIP|11|1|award";
	}
	
}
