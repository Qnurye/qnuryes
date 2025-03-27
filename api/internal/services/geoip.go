package services

import (
	"log"
	"net"
	"os"
	"path/filepath"
	"sync"

	"github.com/oschwald/geoip2-golang"
)

type GeoIPService struct {
	reader *geoip2.Reader
	mutex  sync.RWMutex
}

func NewGeoIPService() (*GeoIPService, error) {
	dbPath := os.Getenv("GEOIP_DB_PATH")
	if dbPath == "" {
		dbPath = filepath.Join("data", "GeoLite2-Country.mmdb")
	}

	reader, err := geoip2.Open(dbPath)
	if err != nil {
		return nil, err
	}

	return &GeoIPService{
		reader: reader,
		mutex:  sync.RWMutex{},
	}, nil
}

func (s *GeoIPService) GetCountryCode(ipAddress string) string {
	ip := net.ParseIP(ipAddress)
	if ip == nil {
		log.Printf("无效的IP地址: %s", ipAddress)
		return "Mars"
	}

	s.mutex.RLock()
	defer s.mutex.RUnlock()

	record, err := s.reader.Country(ip)
	if err != nil {
		log.Printf("获取国家信息失败: %v", err)
		return "Mars"
	}

	if record.Country.IsoCode != "" {
		return record.Country.IsoCode
	}

	return "Mars"
}

func (s *GeoIPService) Close() error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	if s.reader != nil {
		return s.reader.Close()
	}
	return nil
}
