// get the FontAwesome names and generate a JSON conversion map from it
package main

// run as: cd base && go run fa-genmap.go >fa-map.json

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"

	"gopkg.in/yaml.v1"
)

const url = "https://raw.githubusercontent.com/" +
	"FortAwesome/Font-Awesome/master/src/icons.yml"

type FaDef struct{ Id, Unicode string }

func main() {
	res, err := http.Get(url)
	check(err)
	data, err := ioutil.ReadAll(res.Body)
	res.Body.Close()
	check(err)
	// fmt.Println(len(data))
	var entries map[string][]FaDef
	err = yaml.Unmarshal(data, &entries)
	check(err)
	// fmt.Println(len(entries["icons"]))
	out := map[string]string{}
	for _, e := range entries["icons"] {
		u, err := strconv.ParseInt(e.Unicode, 16, 32)
		check(err)
		out[e.Id] = fmt.Sprintf("%c", u)
	}
	// fmt.Println(out)
	text, err := json.MarshalIndent(out, "", "  ")
	check(err)
	fmt.Println(string(text))
}

func check(e interface{}) {
	if e != nil {
		panic(e)
	}
}
