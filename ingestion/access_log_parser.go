package ingestion


import 	 (
	"bytes"
	"regexp"
	// FIXME: proper logging lbrary
	"log"
)

type  AccessLogParser struct {}


func NewAccessLogParser() AccessLogParser {
	return AccessLogParser{}
}

// FIXME: must be configurable: both regexp and list of fields mappings
var pattern =`^(\S*) - (\S*) \[([\w\/:%+\-]+)\] "([A-Z]+) ([^"]*) HTTP\/(\d+\.\d+)" (\d+) (\d+) "([^"]*)" "([^"]*)".*$`
// Compile the regex.
var re = regexp.MustCompile(pattern)

func (AccessLogParser) ParseLogEntries(logdata []byte, metadata map[string]string)  []LogEntry {
	// default size according approximate line  length
	entries := make([]LogEntry, len(logdata) / 80)
	lines := bytes.Split(logdata, []byte("\n"))
	for _, lineBytes := range lines {

		lineStr := string(lineBytes)
		matches := re.FindStringSubmatch(lineStr)
		if len(matches) >0 {
			entry := LogEntry{}
			entry.Raw = lineStr
			entry.Fields = make(map[string]any,18)
			entry.Fields["ip-address"] = matches[1]
			entry.Fields["userid"] = matches[2]
			// FIXME: fields
			entry.Fields["method"] = matches[2]			
			entries = append(entries, entry)
			log.Printf("Parse log entry: %s", entry)
		} else {
			log.Printf("Failed to parse entry as access log: %s", lineStr)
		}
	}
	return entries
}
