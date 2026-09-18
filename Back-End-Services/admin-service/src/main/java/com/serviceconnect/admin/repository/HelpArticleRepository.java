package com.serviceconnect.admin.repository;

import com.serviceconnect.admin.entity.HelpArticle;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface HelpArticleRepository
        extends JpaRepository<HelpArticle, Long> {

    Optional<HelpArticle> findBySlugAndPublishedTrue(
            String slug
    );

    boolean existsBySlug(
            String slug
    );

    boolean existsBySlugAndIdNot(
            String slug,
            Long id
    );

    Page<HelpArticle> findByPublishedTrueOrderByDisplayOrderAscTitleAsc(
            Pageable pageable
    );

    Page<HelpArticle> findByPublishedTrueAndCategoryOrderByDisplayOrderAscTitleAsc(
            String category,
            Pageable pageable
    );

    @Query("""
            SELECT article
            FROM HelpArticle article
            WHERE article.published = true
              AND (:category IS NULL OR article.category = :category)
              AND (
                     LOWER(article.title) LIKE :pattern
                     OR LOWER(article.content) LIKE :pattern
              )
            ORDER BY article.displayOrder ASC,
                     article.title ASC
            """)
    Page<HelpArticle> searchPublishedWithPattern(
            @Param("category")
            String category,

            @Param("pattern")
            String pattern,

            Pageable pageable
    );

    @Query("""
            SELECT DISTINCT article.category
            FROM HelpArticle article
            WHERE article.published = true
            ORDER BY article.category ASC
            """)
    List<String> findPublishedCategories();
}