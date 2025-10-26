import { useState, useCallback } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface UsePDFDownloadReturn {
  isGenerating: boolean
  generatePDF: (elementId: string, filename: string) => Promise<void>
}

export function usePDFDownload(): UsePDFDownloadReturn {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePDF = useCallback(async (elementId: string, filename: string) => {
    setIsGenerating(true)
    
    let element: HTMLElement | null = null
    
    try {
      // PDF 생성 중 불필요한 요소 숨기기 (호버 효과 등)
      document.body.classList.add('pdf-generating')
      
      // 대상 요소 찾기
      element = document.getElementById(elementId)
      if (!element) {
        console.error('PDF 변환할 요소를 찾을 수 없습니다.')
        return
      }

      // 임시로 PDF 전용 패딩 추가
      element.style.paddingLeft = '60px'
      element.style.paddingRight = '20px'

      // HTML을 Canvas로 변환
      const canvas = await html2canvas(element, {
        scale: 2, // 고화질을 위한 스케일 설정
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        removeContainer: false,
        logging: false,
        scrollX: 0,
        scrollY: 0
      })

      // Canvas를 이미지 데이터로 변환
      const imgData = canvas.toDataURL('image/png')
      
      // PDF 문서 생성 (A4 크기)
      const pdf = new jsPDF('portrait', 'mm', 'a4')
      
      // A4 크기 (210 x 297 mm)
      const pdfWidth = 210
      const pdfHeight = 297
      
      // 이미지 크기 계산
      const imgWidth = pdfWidth - 20 // 좌우 여백 10mm씩
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      let heightLeft = imgHeight
      let position = 10 // 상단 여백 10mm
      
      // 첫 번째 페이지에 이미지 추가
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight - 20 // 상하 여백 10mm씩
      
      // 여러 페이지가 필요한 경우 페이지 추가
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
        heightLeft -= pdfHeight - 20
      }
      
      // PDF 다운로드
      pdf.save(`${filename}.pdf`)
      
    } catch (error) {
      console.error('PDF 생성 중 오류 발생:', error)
      alert('PDF 생성 중 오류가 발생했습니다.')
    } finally {
      // 패딩 복구
      if (element) {
        element.style.paddingLeft = ''
        element.style.paddingRight = ''
      }
      
      // PDF 생성 완료 후 클래스 제거
      document.body.classList.remove('pdf-generating')
      setIsGenerating(false)
    }
  }, [])

  return {
    isGenerating,
    generatePDF
  }
}
