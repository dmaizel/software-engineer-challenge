package ingestion

import (
	//	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
)


const headerPrefix = "x-ing-"



func headersToMetadata(headers *http.Header) map[string]string {
	metadata:= make(map[string]string,2)
	for name, vals := range *headers {
		// currently no need for extra values
		name=strings.ToLower(name)
		log.Printf("header: %s %v", name, vals[0])		
		if strings.HasPrefix(name, headerPrefix) {
			metadata[name[len(headerPrefix):]]=vals[0]
		}
	}
	return metadata
}


func StartServer() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request)  {
		if r.Method == http.MethodPost {
			// FIXME: need to support parsing entries from fd, not reading
			//        everything into memory
			body, err := io.ReadAll(r.Body)
			if err != nil {
				http.Error(w, "Error reading request body", http.StatusInternalServerError)
				return
			}
			defer r.Body.Close()
			
			//log.Printf("Received POST data: %s\n", body)
			err = parseLogEentries(body, headersToMetadata(&r.Header))

			// Echo the received data back to the client
			//fmt.Fprintf(w, "You sent: %s", body)
		} else {
			// Handle other requests (e.g., GET)
			http.Error(w, "Error reading request body", http.StatusMethodNotAllowed)
			return 
		}
	})

	server := &http.Server{
		Addr: ":8080",         
		MaxHeaderBytes: 8192,
	}
	log.Printf("Server listening on %s\n", server.Addr)
	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
