/**
 * 分页组件
 * 提供上一页、下一页和跳转到指定页功能
 */
import React, { useState, useEffect } from "react";
import "./index.css"; 

interface PaginationProps {
  page: number;               // 当前页码（从0开始）
  total: number;              // 数据总数
  limit: number;              // 每页显示数量
  onPageChange: (page: number) => void; // 页码变更回调
}

export default function Pagination({ page, total, limit, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / limit);
  const [inputValue, setInputValue] = useState((page + 1).toString());

  // 同步输入框值与当前页码
  useEffect(() => {
    setInputValue((page + 1).toString());
  }, [page]);

  // 处理输入框回车事件 - 跳转到指定页
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const num = parseInt(inputValue, 10);
      if (!isNaN(num) && num >= 1 && num <= totalPages) {
        onPageChange(num - 1);
      } else {
        setInputValue((page + 1).toString()); // 无效输入，恢复原值
      }
    }
  };

  // 只有一页时不显示分页器
  if (totalPages <= 1) return null;

  return (
    <div className="pagination-container">
      <button
        className="pagination-btn"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
        title="上一页"
      >
        ← Prev
      </button>

      <span className="pagination-info">
        Page:{" "}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pagination-input"
        />
        {" / "}{totalPages}
      </span>

      <button
        className="pagination-btn"
        disabled={page === totalPages - 1}
        onClick={() => onPageChange(page + 1)}
        title="下一页"
      >
        Next →
      </button>
    </div>
  );
}