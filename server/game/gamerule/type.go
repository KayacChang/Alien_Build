package gamerule

import (
	attach "github.com/YWJSonic/ServerUtility/attach"
	"github.com/YWJSonic/ServerUtility/igame"
	"github.com/YWJSonic/ServerUtility/user"
)

// JackPartBonusx2Index ...
const JackPartBonusx2Index int64 = 0

// JackPartBonusx3Index ...
const JackPartBonusx3Index int64 = 1

// JackPartBonusx5Index ...
const JackPartBonusx5Index int64 = 2

type jackPart struct {
	JackPartBonusx2 attach.Info
	JackPartBonusx3 attach.Info
	JackPartBonusx5 attach.Info
}

// Rule ...
type Rule struct {
	Version             string        `json:"Version"`             // game logic version
	GameTypeID          string        `json:"GameTypeID"`          // game unique id
	GameIndex           int64         `json:"GameIndex"`           // game sort id
	WinScoreLimit       int64         `json:"WinScoreLimit"`       // game round win money limit
	WinBetRateLimit     int64         `json:"WinBetRateLimit"`     // game round win rate limit
	BetRate             []int64       `json:"BetRate"`             // bate money slice
	BetRateLinkIndex    []int64       `json:"BetRateLinkIndex"`    // player bet fest link index on BetRate slice
	BetRateDefaultIndex int64         `json:"BetRateDefaultIndex"` // default player bet index
	NormalReelSize      []int         `json:"NormalReelSize"`      // Normal reel row size ex:[3,4,5,4,3]
	NormalReelSymbol    [][]int       `json:"NormalReelSymbol"`    // Normal reel [[1,2,3],[4,5,6,7],[1,2,3,4,5],[4,5,6,7],[1,2,3]]
	FreeReelSize        []int         `json:"FreeReelSize"`        // Free reel row size ex:[3,4,5,4,3]
	FreeReelSymbol      [][]int       `json:"FreeReelSymbol"`      // Free reel
	RespinScroll        [][]int       `json:"RespinScroll"`
	RTPSetting          []int         `json:"RTPSetting"` //index 0: normal RTP. index 1:bonus RTP
	Space               int           `json:"Space"`
	WildsItemIndex      []int         `json:"WildsItemIndex"`
	ScotterItemIndex    []int         `json:"ScotterItemIndex"`
	ItemResults         [][]int       `json:"ItemResults"`
	JackPortResults     [][]int       `json:"JackPortResults"`
	RespinitemResults   [][]int       `json:"RespinitemResults"`
	SymbolGroup         map[int][]int `json:"SymbolGroup"`
	SpWhildWinRate      []int64       `json:"SpWhildWinRate"`
	JackPortTex         []float32     `json:"JackPortTex"`
	JackPartWinRate     []int         `json:"JackPartWinRate"`
	ResultRateArray     []int         `json:"ResultRateArray"`
}

func (r *Rule) GetGameIndex() int64 {
	return r.GameIndex
}

// GetGameTypeID ...
func (r *Rule) GetGameTypeID() string {
	return r.GameTypeID
}

// GetGameAttach ...
func (r *Rule) GetGameAttach(user *user.Info) map[string]interface{} {
	jpatt := r.getJPFromAttach(user.IAttach)
	return map[string]interface{}{
		"PlayerID":            user.UserGameInfo.ID,
		"Kind":                r.GameIndex,
		"JackPartBonusPoolx2": jpatt.JackPartBonusx2.GetIValue(),
		"JackPartBonusPoolx3": jpatt.JackPartBonusx3.GetIValue(),
		"JackPartBonusPoolx5": jpatt.JackPartBonusx5.GetIValue(),
	}
}

// GetBetMoney ...
func (r *Rule) GetBetMoney(index int64) int64 {
	return r.BetRate[index]
}

// GetReel ...
func (r *Rule) GetReel() map[string][][]int {
	scrollmap := map[string][][]int{
		"normalreel": r.normalReel(),
		"respinreel": {r.respinReel()},
	}
	return scrollmap
}

// GetBetSetting ...
func (r *Rule) GetBetSetting() map[string]interface{} {
	tmp := make(map[string]interface{})
	tmp["betrate"] = r.BetRate                         //betRate
	tmp["betratelinkindex"] = r.BetRateLinkIndex       //betRateLinkIndex
	tmp["betratedefaultindex"] = r.BetRateDefaultIndex //betRateDefaultIndex
	tmp["winratearray"] = r.ResultRateArray            //resultRateArray
	return tmp
}

// CheckGameType ...
func (r *Rule) CheckGameType(gameTypeID string) bool {
	if r.GameTypeID != gameTypeID {
		return false
	}
	return true
}

func (r *Rule) normalReel() [][]int {
	return r.NormalReelSymbol
}
func (r *Rule) respinReel() []int {
	return r.RespinScroll[r.normalRTP()]
}
func (r *Rule) normalRTP() int {
	return r.RTPSetting[0]
}
func (r *Rule) respinRTP() int {
	return r.RTPSetting[1]
}

// Wild1 ...
func (r *Rule) Wild1() int {
	return r.WildsItemIndex[0]
}

// Wild2 ...
func (r *Rule) Wild2() int {
	return r.WildsItemIndex[1]
}

// Wild3 ...
func (r *Rule) Wild3() int {
	return r.WildsItemIndex[2]
}

// Wild4 ...
func (r *Rule) Wild4() int {
	return r.WildsItemIndex[3]
}

// func (r *GameLogic) LogicResult(betMoney int64, user *user.Info) map[string]interface{} {

// 	// return
// }

// func (r *GameLogic) OutputGame(betMoney int64, user *user.Info) (map[string]interface{}, map[string]interface{}, int64) {
// }

// func (r *GameLogic) outRespin(betMoney int64, user *user.Info) ([]interface{}, int64) {
// }

// GameRequest ...
func (r *Rule) GameRequest(config *igame.RuleRequest) *igame.RuleRespond {
	betMoney := r.GetBetMoney(config.BetIndex)
	jackPart := r.getJPFromAttach(*config.Attach)
	result := make(map[string]interface{})
	otherData := make(map[string]interface{})
	var totalWin int64

	gameResult := r.newlogicResult(betMoney, &jackPart)

	result["normalresult"] = gameResult.Normalresult
	totalWin += gameResult.Normaltotalwin

	if gameResult.Respinresult != nil {
		result["respin"] = gameResult.Respinresult
		otherData["isrespin"] = 1
		totalWin += gameResult.Respintotalwin
	}

	newatt := r.setJPFromAttach(betMoney, &jackPart)
	result["totalwinscore"] = totalWin
	otherData["JackPartBonusPoolx2"] = newatt[0].GetIValue()
	otherData["JackPartBonusPoolx3"] = newatt[1].GetIValue()
	otherData["JackPartBonusPoolx5"] = newatt[2].GetIValue()
	return &igame.RuleRespond{
		Attach:        newatt,
		BetMoney:      betMoney,
		Totalwinscore: totalWin,
		GameResult:    result,
		OtherData:     otherData,
	}
}
func (r *Rule) setJPFromAttach(betMoney int64, jP *jackPart) []*attach.Info {
	JB2 := attach.NewInfo(int64(r.GameIndex), JackPartBonusx2Index, true)
	JB2.SetIValue(jP.JackPartBonusx2.GetIValue() + int64(float32(betMoney)*r.JackPortTex[2]))
	JB3 := attach.NewInfo(int64(r.GameIndex), JackPartBonusx3Index, true)
	JB3.SetIValue(jP.JackPartBonusx3.GetIValue() + int64(float32(betMoney)*r.JackPortTex[1]))
	JB5 := attach.NewInfo(int64(r.GameIndex), JackPartBonusx5Index, true)
	JB5.SetIValue(jP.JackPartBonusx5.GetIValue() + int64(float32(betMoney)*r.JackPortTex[0]))
	return []*attach.Info{JB2, JB3, JB5}
}
func (r *Rule) getJPFromAttach(att attach.IAttach) jackPart {
	value := jackPart{
		JackPartBonusx2: *att.Get(int64(r.GameIndex), JackPartBonusx2Index),
		JackPartBonusx3: *att.Get(int64(r.GameIndex), JackPartBonusx3Index),
		JackPartBonusx5: *att.Get(int64(r.GameIndex), JackPartBonusx5Index),
	}
	return value
}

// // Result att 0: freecount
// func (r *Rule) logicResult(betMoney int64, JP *jackPart) map[string]interface{} {
// 	var result = make(map[string]interface{})
// 	var totalWin int64
// 	normalresult, otherdata, normaltotalwin := r.outputGame(betMoney, JP)
// 	result = foundation.AppendMap(result, otherdata)
// 	result["normalresult"] = normalresult
// 	totalWin += normaltotalwin
// 	if otherdata["isrespin"].(int) == 1 {
// 		respinresult, respintotalwin := r.outRespin(betMoney, JP)
// 		totalWin += respintotalwin
// 		result["respin"] = respinresult
// 		result["isrespin"] = 1
// 	}
// 	result["totalwinscore"] = totalWin
// 	return result
// }
