// The (very early) start of a G-code parser.
package gcode

import (
	"fmt"
	"sort"
	"strconv"
	"strings"

	"github.com/jcw/flow"
)

func init() {
	flow.Registry["GcodeScanner"] = func() flow.Circuitry { return &GcodeScanner{} }
	flow.Registry["GcodeParser"] = func() flow.Circuitry { return &GcodeParser{} }
	flow.Registry["GcodeInterp"] = func() flow.Circuitry { return &GcodeInterp{} }
}

// GcodeScanner processes G-code text lines and turns each line into a word map.
type GcodeScanner struct {
	flow.Gadget
	In  flow.Input
	Out flow.Output
}

// Start scanning lines and convert each one to a map of G-code "words".
func (g *GcodeScanner) Run() {
	for m := range g.In {
		if s, ok := m.(string); ok {
			words, comment := g.scan(s)
			if len(comment) > 0 {
				g.Out.Send(flow.Tag{"<comment>", comment})
			}
			if len(words) > 0 {
				g.Out.Send(words)
			}
		} else {
			g.Out.Send(m)
		}
	}
}

func (g *GcodeScanner) scan(s string) (words map[string]float64, comment string) {
	words = map[string]float64{}
	i, n := 0, len(s)
	u := strings.ToUpper(s)

	// scan and skip the next number
	number := func() (string, float64) {
		// remove leading white space
		for i < n && s[i] == ' ' {
			i++
		}
		// collect digits, etc
		pos := i
		for i < n && strings.IndexByte("0123456789-.", s[i]) >= 0 {
			i++
		}
		t := s[pos:i]
		// return as string and as float
		f, _ := strconv.ParseFloat(t, 64)
		return t, f
	}

	for i < n {
		cmd := u[i]
		i++

		switch cmd {
		case ';', '(':
			comment = s[i:]
			return
		case 'G', 'M':
			t, f := number()
			// remove leading 0's, so that "G01" will end up as "G1"
			t = strings.TrimLeft(t, "0")
			if t == "" {
				t = "0"
			}
			words[fmt.Sprintf("%c%s", cmd, t)] = f
		default:
			if 'A' <= cmd && cmd <= 'Z' {
				_, f := number()
				words[fmt.Sprintf("%c", cmd)] = f
			}
		}
	}
	return
}

// see http://www.linuxcnc.org/docs/devel/html/gcode/overview.html
// in particular, section 25: G Code Order of Execution

// used to sort G and M commands in the order they need to be executed
var wordOrder = initWordOrder()

func initWordOrder() map[string]int {
	wo := map[string]int{}
	seq := 0

	add := func(s string) {
		for _, v := range strings.Split(s, " ") {
			wo[v] = seq
		}
		seq++
	}

	//  O-word commands (optionally followed by a comment but no other words allowed on the same line)
	add("O")
	//  Comment (including message)
	//  Set feed rate mode (G93, G94).
	add("G93 G94")
	//  Set feed rate (F).
	add("F")
	//  Set spindle speed (S).
	add("S")
	//  Select tool (T).
	add("T")
	//  HAL pin I/O (M62-M68).
	add("M62 M63 M64 M65 M66 M67 M68")
	//  Change tool (M6) and Set Tool Number (M61).
	add("M6 M61")
	//  Spindle on or off (M3, M4, M5).
	add("M3 M4 M5")
	//  Save State (M70, M73), Restore State (M72), Invalidate State (M71).
	add("M70 M71 M72 M73")
	//  Coolant on or off (M7, M8, M9).
	add("M7 M8 M9")
	//  Enable or disable overrides (M48, M49,M50,M51,M52,M53).
	add("M48 M49 M50 M51 M52 M53")
	//  User-defined Commands (M100-M199).
	add("M100 M101 M102 M103 M104 M105 M106 M107 M108 M109")
	add("M110 M111 M112 M113 M114 M115 M116 M117 M118 M119")
	add("M120 M121 M122 M123 M124 M125 M126 M127 M128 M129")
	add("M130 M131 M132 M133 M134 M135 M136 M137 M138 M139")
	add("M140 M141 M142 M143 M144 M145 M146 M147 M148 M149")
	add("M150 M151 M152 M153 M154 M155 M156 M157 M158 M159")
	add("M160 M161 M162 M163 M164 M165 M166 M167 M168 M169")
	add("M160 M161 M162 M163 M164 M165 M166 M167 M168 M169")
	add("M170 M171 M172 M173 M174 M175 M176 M177 M178 M179")
	add("M180 M181 M182 M183 M184 M185 M186 M187 M188 M189")
	add("M190 M191 M192 M193 M194 M195 M196 M197 M198 M199")
	//  Dwell (G4).
	add("G4")
	//  Set active plane (G17, G18, G19).
	add("G17 G18 G19")
	//  Set length units (G20, G21).
	add("G20 G21")
	//  Cutter radius compensation on or off (G40, G41, G42)
	add("G40 G41 G42")
	//  Cutter length compensation on or off (G43, G49)
	add("G43 G49")
	//  Coordinate system selection (G54, G55, G56, G57, G58, G59, G59.1, G59.2, G59.3).
	add("G54 G55 G56 G57 G58 G59 G59.1 G59.2 G59.3")
	//  Set path control mode (G61, G61.1, G64)
	add("G61 G61.1 G64")
	//  Set distance mode (G90, G91).
	add("G90 G91")
	//  Set retract mode (G98, G99).
	add("G98 G99")
	//  Go to reference location (G28, G30) or change coordinate system data (G10) or set axis offsets (G92, G92.1, G92.2, G94).
	add("G10 G28 G30 G92 G92.1 G92.2 G94")
	//  Perform motion (G0 to G3, G33, G38.x, G73, G76, G80 to G89), as modified (possibly) by G53.
	add("G0 G1 G2 G3 G33 G38.2 G38.3 G38.4 G38.5 G73 G76")
	add("G80 G81 G82 G83 G84 G85 G86 G87 G88 G89")
	//  Stop (M0, M1, M2, M30, M60).
	add("M0 M1 M2 M30 M60")
	return wo
}

// GcodeParser parses word maps and produces commands.
type GcodeParser struct {
	flow.Gadget
	In  flow.Input
	Out flow.Output
}

// Start parsing word maps and produce the corresponding commands.
func (g *GcodeParser) Run() {
	for m := range g.In {
		if words, ok := m.(map[string]float64); ok {
			g.parse(words)
		} else {
			g.Out.Send(m)
		}
	}
}

// see section 15: Modal Groups
const modalLimit = 16

var modalGroups = []string{
	/* 0  */ "G4 G10 G28 G30 G53 G92 G92.1 G92.2 G92.3 ",
	/* 1  */ "G0 G1 G2 G3 G33 G38.2 G38.3 G38.4 G38.5 G73 G76 G80 G81 G82 G83 G84 G85 G86 G87 G88 G89",
	/* 2  */ "G17 G18 G19 G17.1 G18.1 G19.1",
	/* 3  */ "G90 G91",
	/* 4  */ "G90.1 G91.1 M0 M1 M2 M30 M60",
	/* 5  */ "G93 G94 G95 M6",
	/* 6  */ "G20 G21",
	/* 7  */ "G40 G41 G42 G41.1 G42.1 M3 M4 M5",
	/* 8  */ "G43 G43.1 G49 M7 M8 M9",
	/* 9  */ "M48 M49",
	/* 10 */ "G98 G99",
	/* 11 */ "",
	/* 12 */ "G54 G55 G56 G57 G58 G59 G59.1 G59.2 G59.3",
	/* 13 */ "G61 G61.1 G64",
	/* 14 */ "G96 G97",
	/* 15 */ "G7 G8",
}

// used to determine which modal group a G or M command belongs to
var modalMap = initModalMap()

func initModalMap() map[string]int {
	if modalLimit != len(modalGroups) {
		panic(fmt.Errorf("modalLimit should be %d !", len(modalGroups)))
	}
	mm := map[string]int{}
	for k, v := range modalGroups {
		for _, x := range strings.Split(v, " ") {
			mm[x] = k
		}
	}
	return mm
}

func (g *GcodeParser) parse(words map[string]float64) {
	modals := [modalLimit]string{} // allows at most one in each modal group
	actions := []string{}          // used to collect all "actionable" words

	// pick out all the modal and non-modal words which need to be sorted
	for k := range words {
		if n, ok := modalMap[k]; ok {
			modals[n] = k
			delete(words, k)
		} else if _, ok := wordOrder[k]; ok {
			actions = append(actions, k)
		}
	}
	// append the modal commands we found as also being actionable
	for _, k := range modals {
		if k != "" {
			actions = append(actions, k)
		}
	}
	// sort by the order indicated in the wordOrder map
	sort.Sort(byOrder(actions))

	g.Out.Send(words)
	g.Out.Send(actions)
}

type byOrder []string

func (a byOrder) Len() int           { return len(a) }
func (a byOrder) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a byOrder) Less(i, j int) bool { return wordOrder[a[i]] < wordOrder[a[j]] }

// GcodeInterp interprets word maps and action lists to generate commands.
type GcodeInterp struct {
	flow.Gadget
	In  flow.Input
	Out flow.Output

	position  [4]float64
	mode [modalLimit]string
	state map[string]float64
}

const (
	cX = iota
	cY
	cZ
	cF
)

// Start interpreting the word maps and action lists from the parser.
func (g *GcodeInterp) Run() {
	g.state = map[string]float64{}
	var words map[string]float64

	for m := range g.In {
		switch v := m.(type) {
		case (map[string]float64):
			words = v
		case ([]string):
			g.process(words, v)
		default:
			g.Out.Send(m)
		}
	}
}

func (g *GcodeInterp) process(words map[string]float64, actions []string) {
	target := g.position
	cmd := ""

	setCoord := func(x string, i int) {
		if v, ok := words[x]; ok {
			target[i] = v
		}
	}

	setCoord("X", cX)
	setCoord("Y", cY)
	setCoord("Z", cZ)

	emitTarget := func() {
		g.Out.Send(flow.Tag{cmd, target})
		g.position = target
		g.updateState(cmd)
	}

	emitValue := func(value interface{}) {
		g.Out.Send(flow.Tag{cmd, value})
		g.updateState(cmd)
	}

	for _, cmd = range actions {
		value := words[cmd]
		if cmd[0] != 'G' && cmd[0] != 'M' {
			g.state[cmd] = value
		}

		switch cmd {
		case "F":
			target[cF] = value
		case "S":
			emitValue(value)
		case "G0":
			rapid := target
			rapid[cF] = 1e9
			emitValue(rapid)
		case "G1":
			emitTarget()
		default:
			if cmd[0] == 'M' {
				emitValue(nil)
			} else {
				g.Out.Send(flow.Tag{"<ignored>", cmd})
			}
		}
	}

	// fmt.Println(strings.Join(g.mode[:], "-"), g.state)
}

func (g *GcodeInterp) updateState(cmd string) {
	if m, ok := modalMap[cmd]; ok {
		g.mode[m] = cmd
	}
}
