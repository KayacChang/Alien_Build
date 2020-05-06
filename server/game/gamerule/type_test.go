package gamerule

import (
	"fmt"
	"testing"

	"github.com/YWJSonic/ServerUtility/foundation"
)

func TestRule_GameRequest(t *testing.T) {
	mmi := make(map[string]map[string]interface{})
	mmi["1"] = make(map[string]interface{}, 0)
	// att := gameattach.NewAttach(5)
	// att.SetValue(7, 5, "", 1)
	// att.SetValue(7, 6, "", 2)
	// att.SetValue(7, 7, "", 3)

	// uaa := att.(*gameattach.UserAttach)
	mmi["1"]["2"] = 3
	fmt.Println(foundation.JSONToString(mmi))
}
