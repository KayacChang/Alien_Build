package gamerule

import (
	"fmt"

	"github.com/YWJSonic/ServerUtility/foundation"
	"github.com/YWJSonic/ServerUtility/gameplate"
)

type result struct {
	Normalresult   map[string]interface{}
	Otherdata      map[string]interface{}
	Normaltotalwin int64
	Respinresult   []interface{}
	Respintotalwin int64
}

// Result att 0: freecount
func (r *Rule) newlogicResult(betMoney int64, JP *jackPart) result {

	normalresult, otherdata, normaltotalwin := r.outputGame(betMoney, JP)

	if otherdata["isrespin"].(int) != 1 {
		return result{
			Normalresult:   normalresult,
			Otherdata:      otherdata,
			Normaltotalwin: normaltotalwin,
		}
	}

	respinresult, respintotalwin := r.outRespin(betMoney, JP)
	return result{
		Normalresult:   normalresult,
		Otherdata:      otherdata,
		Normaltotalwin: normaltotalwin,
		Respinresult:   respinresult,
		Respintotalwin: respintotalwin,
	}

}

// outputGame out put normal game result, mini game status, totalwin
func (r *Rule) outputGame(betMoney int64, JP *jackPart) (map[string]interface{}, map[string]interface{}, int64) {
	var totalScores int64
	var WinRateIndex int
	var result map[string]interface{}
	otherdata := make(map[string]interface{})
	islink := false

	ScrollIndex, plate := gameplate.NewPlate(r.NormalReelSize, r.normalReel())
	gameresult := r.normalResultArray(plate)

	otherdata["isrespin"] = 0

	if r.isRespin(plate) {
		otherdata["isrespin"] = 1
	}

	if len(gameresult) > 0 {
		islink = true
		WinRateIndex = gameresult[0][3]
		reGameResult := r.dynamicScore(plate, gameresult[0])
		switch WinRateIndex {
		case -101:
			totalScores = betMoney*int64(reGameResult[3]) + JP.JackPartBonusx2.GetIValue()
			JP.JackPartBonusx2.SetIValue(0)
		case -102:
			totalScores = betMoney*int64(reGameResult[3]) + JP.JackPartBonusx3.GetIValue()
			JP.JackPartBonusx3.SetIValue(0)
		case -103:
			totalScores = betMoney*int64(reGameResult[3]) + JP.JackPartBonusx5.GetIValue()
			JP.JackPartBonusx5.SetIValue(0)

		default:
			totalScores = betMoney * int64(reGameResult[3])
			switch plate[1] {
			case r.Wild2():
				totalScores *= r.SpWhildWinRate[0]
			case r.Wild3():
				totalScores *= r.SpWhildWinRate[1]
			case r.Wild4():
				totalScores *= r.SpWhildWinRate[2]
			default:
			}
		}
	}

	if totalScores < 0 {
		fmt.Println(totalScores)
	}
	result = gameplate.ResultMap(ScrollIndex, plate, totalScores, islink)
	return result, otherdata, totalScores
}

// outRespin out put respin result and totalwin
func (r *Rule) outRespin(betMoney int64, JP *jackPart) ([]interface{}, int64) {
	var totalScores, respinScores, totalWinRate int64
	var WinRateIndex int
	var ScrollIndex, plate []int
	var result []interface{}
	respintScrollData := r.respinReel()
	islink := false

	for index, max := 0, 200; index < max; index++ {
		islink = false
		respinScores = 0
		ScrollIndex, plate = gameplate.NewPlate([]int{1, 1, 1}, [][]int{{0}, respintScrollData, {0}})
		gameresult := r.respinResultArray(plate)

		if len(gameresult) > 0 {
			islink = true
			WinRateIndex = gameresult[0][3]
			reGameResult := r.dynamicScore(plate, gameresult[0])
			totalWinRate += int64(reGameResult[3])
			switch WinRateIndex {
			case -101:
				respinScores = betMoney*int64(reGameResult[3]) + JP.JackPartBonusx2.GetIValue()
				JP.JackPartBonusx2.SetIValue(0)
			case -102:
				respinScores = betMoney*int64(reGameResult[3]) + JP.JackPartBonusx3.GetIValue()
				JP.JackPartBonusx3.SetIValue(0)
			case -103:
				respinScores = betMoney*int64(reGameResult[3]) + JP.JackPartBonusx5.GetIValue()
				JP.JackPartBonusx5.SetIValue(0)
			default:
				respinScores = betMoney * int64(reGameResult[3])
			}
		}

		totalScores += respinScores
		freeresult := gameplate.ResultMap(ScrollIndex, plate, respinScores, islink)
		result = append(result, freeresult)

		if len(gameresult) <= 0 {
			break
		} else if index >= max-1 {
			result = append(result, r.emptyResult())
			break
		}
	}
	return result, totalScores
}

// winresultArray ...
func (r *Rule) normalResultArray(plate []int) [][]int {
	var result [][]int

	for _, JackPortResult := range r.JackPortResults {
		if r.isJackportWin(plate, JackPortResult) {
			result = append(result, JackPortResult)
			return result
		}
	}

	for _, ItemResult := range r.ItemResults {
		if r.isNormalWin(plate, ItemResult) {
			result = append(result, ItemResult)
		}
	}
	return result

}

// RespinResult result 0: icon index, 1: win rate
func (r *Rule) respinResultArray(plate []int) [][]int {
	var result [][]int

	for _, JackPortResult := range r.JackPortResults {
		if r.isJackportWin(plate, JackPortResult) {
			result = append(result, JackPortResult)
		}
	}

	for _, RespinResult := range r.RespinitemResults {
		if r.isRespinWin(plate, RespinResult) {
			result = append(result, RespinResult)
		}
	}

	return result
}

// EmptyResult return a not win result
func (r *Rule) emptyResult() map[string]interface{} {
	return gameplate.ResultMap([]int{0, 0, 0}, []int{0, r.Space, 0}, 0, false)
}

// dynamicScore convert results list dynamic score
func (r *Rule) dynamicScore(plant, currendResult []int) []int {
	if !r.isDynamicResult(currendResult) {
		return currendResult
	}

	dynamicresult := make([]int, len(currendResult))
	copy(dynamicresult, currendResult)

	switch currendResult[3] {
	case -100:
		for _, result := range r.ItemResults {
			if result[1] == plant[1] {
				dynamicresult[3] = result[3]
				break
			}
		}
	case -101:
		dynamicresult[3] = int(r.JackPartWinRate[0])
		break
	case -102:
		dynamicresult[3] = int(r.JackPartWinRate[1])
		break
	case -103:
		dynamicresult[3] = int(r.JackPartWinRate[2])
		break
	}

	return dynamicresult
}

func (r *Rule) isDynamicResult(result []int) bool {
	if result[3] < 0 {
		return true
	}
	return false
}

func (r *Rule) isNormalWin(plates []int, result []int) bool {
	IsWin := false
	for i, plate := range plates {
		IsWin = false

		if plate == r.Space {
			return false
		}

		if plate == r.Wild1() || plate == r.Wild2() || plate == r.Wild3() || plate == r.Wild4() {
			IsWin = true
		} else {

			switch result[i] {
			case plate:
				IsWin = true
			case -1000:
				IsWin = true
			case -1001: // any bar
				if foundation.IsInclude(plate, r.SymbolGroup[result[i]]) {
					IsWin = true
				}
			}
		}
		if !IsWin {
			return IsWin
		}
	}

	return IsWin
}

func (r *Rule) isRespinWin(plates []int, result []int) bool {
	return r.isNormalWin(plates, result)
}

func (r *Rule) isJackportWin(plates []int, result []int) bool {
	if plates[0] == result[0] && plates[1] == result[1] && plates[2] == result[2] {
		return true
	}

	return false
}

func (r *Rule) isRespin(plates []int) bool {
	if plates[0] == 0 && plates[2] == 0 {
		return true
	}
	return false
}

func (r *Rule) isSpWild(plates []int) bool {
	if plates[1] == r.Wild2() || plates[1] == r.Wild3() || plates[1] == r.Wild4() {
		return true
	}
	return false
}
