
package ingestion

import (
	"log"
	"time"
)


type LogEntry struct {
	Timestamp  time.Time
	Raw string;
	Fields map[string]any
}


type LogParser interface {
	ParseLogEntries(logdata []byte, metadata map[string]string)  []LogEntry
}

var parsers []LogParser


func parseLogEentries (logdata []byte, metadata map[string]string) error {
	log.Printf("Received logs data: %s %v\n", logdata, metadata)
	
	return nil
}


func init() {
	log.Printf("initializing built-in parsers")
	parsers=append(parsers, NewAccessLogParser())
}


