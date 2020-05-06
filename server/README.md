[https://hackmd.io/cx7Mu-kUR62m0qynB-cNjg?both](https://hackmd.io/cx7Mu-kUR62m0qynB-cNjg?both)
---
# 外星人
## Client API
### 
### POST /game/init

```HTTP
POST http://<gameserverIP>:8000/game/init HTTP/2.0
Authorization: <token>

```

##### Request

##### Respont

```JSON
 {
	"data": {
		map[string]interface {} {
			"attach": map[string]interface {} {
				"PlayerID": int,
				"Kind": int,
				"JackPartBonusPoolx2": int,
				"JackPartBonusPoolx3": int,
				"JackPartBonusPoolx5": int,
			},
			"betrate": {
				"betrate":[]int,
				"betratedefaultindex":int,
				"betratelinkindex":[]int,
				"winratearray":[]int
			},
			"player": map[string]interface {} {
				"id": int,
				"money": int,
			},
			"reel":{
				"normalreel":[][]int,
				"respinreel":[]int
			}
		}
	},
	"error":{
		"ErrorCode":int,
		"Msg":string,
	}
}

```

| Column 1            | Column 2 | Column 3               |
| ------------------- | -------- |:---------------------- |
| JackPartBonusPoolx2 | int      | 個人2倍JP當前累積金    |
| JackPartBonusPoolx3 | int      | 個人3倍JP當前累積金額  |
| JackPartBonusPoolx5 | int      | 個人5倍JP當前累積金額  |
| betrate             | []int    | 可下注金額             |
| betratedefaultindex | int      | 預設下注顯示(表演用)   |
| betratelinkindex    | int      | 下注金額快捷鍵(表演用) |
| winratearray        | int      | 賠率表(表演用)         |
| id                  | int      | 玩家遊戲ID             |
| money               | int      | 玩家現有金額           |
| normalreel          | [][]int  | 一般遊戲輪帶           |
| respinreel          | []int    | 重轉輪帶               |
| ErrorCode           | int      | 錯誤代碼               |
| Msg                 | string   | 錯誤訊息               |

### POST /game/result
```HTTP
POST http://<gameserverIP>:8000/game/result HTTP/2.0
Authorization: <token>
```

##### Request
```JSON
{
    "gametypeid":string,
    "bet":int,
    "playerid":int
}
```


| Column 1   | Column 2 | Column 3       |
| ---------- | -------- |:-------------- |
| gametypeid | string   | 遊戲類型ID     |
| bet        | int      | 下注金額索引值 |
| playerid   | int      | 玩家ID         |

##### Respont

```JSON
{
    "data": {
        "attach": {
            "JackPartBonusPoolx2": int,
            "JackPartBonusPoolx3": int,
            "JackPartBonusPoolx5": int,
            "Kind": int,
            "PlayerID": int
        },
        "isrespin": int,
        "normalresult": {
            "islink": int,
            "plate": []int,
            "plateindex": []int,
            "scores": int
        },
        "playermoney": int,
        "totalwinscore": int
    },
    "error": {
        "ErrorCode": int,
        "Msg": string
    }
}
```


| Column 1            | Column 2 | Column 3              |
| ------------------- | -------- | --------------------- |
| JackPartBonusPoolx2 | int      | 個人2倍JP當前累積金   |
| JackPartBonusPoolx3 | int      | 個人3倍JP當前累積金額 |
| JackPartBonusPoolx5 | int      | 個人5倍JP當前累積金額 |
| Kind                | int      | 遊戲類型ID            |
| isrespin            | int      | 是否有觸發重轉        |
| islink              | int      | 是否有賠付連線        |
| plate               | []int    | 當局盤面              |
| plateindex          | []int    | 當局盤面輪帶索引值    |
| scores              | int      | 此盤面總贏分          |
| playermoney         | int      | 玩家最後總金額        |
| totalwinscore       | int      | 當局總贏分                |
