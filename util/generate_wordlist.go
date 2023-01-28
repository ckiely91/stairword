package main

import (
	"encoding/json"
	"log"
	"os"
	"sort"
	"strings"
	"sync"
	"sync/atomic"
)

type wordAndLength struct {
	Word      string `json:"w"`
	Match     string `json:"m"`
	MaxLength int    `json:"l"`
}

const minOverlapLength = 3

var potentialSuffixes = []string{
	"s",
	"es",
	"ed",
}

func main() {
	var allWords []string
	var startWords, endWords []wordAndLength

	f, err := os.Open("./wordlists/allWords.json")
	if err != nil {
		panic(err)
	}

	defer f.Close()

	err = json.NewDecoder(f).Decode(&allWords)
	if err != nil {
		panic(err)
	}

	approxRoutines := 10
	chunkSize := len(allWords) / approxRoutines
	chunks := chunkSlice[string](allWords, chunkSize)
	wg := &sync.WaitGroup{}
	mu := &sync.Mutex{}
	totalDone := int64(0)

	for i := 0; i < len(chunks); i++ {
		chunk := chunks[i]
		wg.Add(1)

		go func() {
			defer wg.Done()

			var chunkStartWords, chunkEndWords []wordAndLength

			for i, word := range chunk {
				// First find overlaps with the end of the word, at least 3 letters
				numLettersOverlappingStart := 0
				overlappingStartWord := ""
				numLettersOverlappingEnd := 0
				overlappingEndWord := ""

			overlappingLoop:
				for i := 1; i <= len(word)-minOverlapLength; i++ {
				wordLoop:
					for _, testWord := range allWords {
						if testWord == word {
							continue wordLoop
						}

						for _, suffix := range potentialSuffixes {
							if testWord+suffix == word || strings.TrimSuffix(testWord, suffix) == word {
								continue wordLoop
							}
						}

						if numLettersOverlappingEnd == 0 && strings.HasPrefix(testWord, word[i:]) {
							numLettersOverlappingEnd = len(word[i:])
							overlappingEndWord = testWord
						}

						if numLettersOverlappingStart == 0 && strings.HasSuffix(testWord, word[:len(word)-i]) {
							numLettersOverlappingStart = len(word[:len(word)-i])
							overlappingStartWord = testWord
						}

						if numLettersOverlappingStart > 0 && numLettersOverlappingEnd > 0 {
							break overlappingLoop
						}
					}
				}

				if numLettersOverlappingEnd >= minOverlapLength {
					chunkStartWords = append(chunkStartWords, wordAndLength{
						Word:      word,
						Match:     overlappingEndWord,
						MaxLength: numLettersOverlappingEnd,
					})
				}

				if numLettersOverlappingStart >= minOverlapLength {
					chunkEndWords = append(chunkEndWords, wordAndLength{
						Word:      word,
						Match:     overlappingStartWord,
						MaxLength: numLettersOverlappingStart,
					})
				}

				if i%1000 == 0 {
					newTotalDone := atomic.AddInt64(&totalDone, 1000)
					log.Printf("%v", newTotalDone)
				}
			}

			mu.Lock()
			startWords = append(startWords, chunkStartWords...)
			endWords = append(endWords, chunkEndWords...)
			mu.Unlock()
		}()
	}

	wg.Wait()

	sort.Slice(startWords, func(i, j int) bool {
		if startWords[i].MaxLength == startWords[j].MaxLength {
			return startWords[i].Word < startWords[j].Word
		}

		return startWords[i].MaxLength > startWords[j].MaxLength
	})

	sort.Slice(endWords, func(i, j int) bool {
		if endWords[i].MaxLength == endWords[j].MaxLength {
			return endWords[i].Word < endWords[j].Word
		}

		return endWords[i].MaxLength > endWords[j].MaxLength
	})

	startWordsF, err := os.Create("./wordlists/startWords.json")
	if err != nil {
		panic(err)
	}
	defer startWordsF.Close()

	endWordsF, err := os.Create("./wordlists/endWords.json")
	if err != nil {
		panic(err)
	}
	defer endWordsF.Close()

	enc := json.NewEncoder(startWordsF)
	enc.SetIndent("", "  ")
	err = enc.Encode(startWords)
	if err != nil {
		panic(err)
	}

	enc = json.NewEncoder(endWordsF)
	enc.SetIndent("", "  ")
	err = enc.Encode(endWords)
	if err != nil {
		panic(err)
	}

	log.Printf("DONE!!!")
}

func chunkSlice[T any](slice []T, chunkSize int) [][]T {
	var chunks [][]T
	for i := 0; i < len(slice); i += chunkSize {
		end := i + chunkSize

		// necessary check to avoid slicing beyond
		// slice capacity
		if end > len(slice) {
			end = len(slice)
		}

		chunks = append(chunks, slice[i:end])
	}

	return chunks
}
