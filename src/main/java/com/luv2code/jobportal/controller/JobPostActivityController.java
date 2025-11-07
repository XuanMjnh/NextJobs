package com.luv2code.jobportal.controller;

import com.luv2code.jobportal.entity.*;
import com.luv2code.jobportal.services.JobPostActivityService;
import com.luv2code.jobportal.services.JobSeekerApplyService;
import com.luv2code.jobportal.services.JobSeekerSaveService;
import com.luv2code.jobportal.services.UsersService;
import com.luv2code.jobportal.util.FileUploadUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Controller
public class JobPostActivityController {

    private final UsersService usersService;
    private final JobPostActivityService jobPostActivityService;
    private final JobSeekerApplyService jobSeekerApplyService;
    private final JobSeekerSaveService jobSeekerSaveService;

    @Autowired
    public JobPostActivityController(UsersService usersService,
                                     JobPostActivityService jobPostActivityService,
                                     JobSeekerApplyService jobSeekerApplyService,
                                     JobSeekerSaveService jobSeekerSaveService) {
        this.usersService = usersService;
        this.jobPostActivityService = jobPostActivityService;
        this.jobSeekerApplyService = jobSeekerApplyService;
        this.jobSeekerSaveService = jobSeekerSaveService;
    }

    /* ======================= DASHBOARD ======================= */

    @GetMapping("/dashboard/")
    public String searchJobs(Model model,
                             @RequestParam(value = "job", required = false) String job,
                             @RequestParam(value = "location", required = false) String location,
                             @RequestParam(value = "partTime", required = false) String partTime,
                             @RequestParam(value = "fullTime", required = false) String fullTime,
                             @RequestParam(value = "freelance", required = false) String freelance,
                             @RequestParam(value = "internship", required = false) String internship,
                             @RequestParam(value = "remoteOnly", required = false) String remoteOnly,
                             @RequestParam(value = "officeOnly", required = false) String officeOnly,
                             @RequestParam(value = "partialRemote", required = false) String partialRemote,
                             @RequestParam(value = "today", required = false) boolean today,
                             @RequestParam(value = "days7", required = false) boolean days7,
                             @RequestParam(value = "days30", required = false) boolean days30) {

        // Bind lại các tham số cho view (checkbox & input)
        model.addAttribute("partTime", Objects.equals(partTime, "Part-Time"));
        model.addAttribute("fullTime", Objects.equals(fullTime, "Full-Time"));
        model.addAttribute("freelance", Objects.equals(freelance, "Freelance"));
        model.addAttribute("internship", Objects.equals(internship, "Internship"));

        model.addAttribute("remoteOnly", Objects.equals(remoteOnly, "Remote-Only"));
        model.addAttribute("officeOnly", Objects.equals(officeOnly, "Office-Only"));
        model.addAttribute("partialRemote", Objects.equals(partialRemote, "Partial-Remote"));
        model.addAttribute("today", today);
        model.addAttribute("days7", days7);
        model.addAttribute("days30", days30);
        model.addAttribute("job", job);
        model.addAttribute("location", location);

        Object currentUserProfile = usersService.getCurrentUserProfile();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!(authentication instanceof AnonymousAuthenticationToken)) {
            model.addAttribute("username", authentication.getName());
        }
        model.addAttribute("user", currentUserProfile);

        boolean isRecruiter = authentication != null
                && authentication.getAuthorities().contains(new SimpleGrantedAuthority("Recruiter"));

        // =========== RECRUITER: chỉ xem/tìm trong job của chính mình ===========
        if (isRecruiter) {
            List<JobPostActivity> jobs;
            boolean noKeyword = !StringUtils.hasText(job) && !StringUtils.hasText(location);
            if (noKeyword) {
                jobs = jobPostActivityService.getRecruiterOwnJobs();
            } else {
                jobs = jobPostActivityService.searchRecruiterOwn(job, location);
            }
            model.addAttribute("jobPost", jobs);
            return "dashboard";
        }

        // =========== JOB SEEKER: filter đầy đủ (type/remote/date) ===========
        LocalDate searchDate = null;
        boolean dateSearchFlag = true;
        boolean remote = true;
        boolean type = true;

        if (days30) searchDate = LocalDate.now().minusDays(30);
        else if (days7) searchDate = LocalDate.now().minusDays(7);
        else if (today) searchDate = LocalDate.now();
        else dateSearchFlag = false;

        if (partTime == null && fullTime == null && freelance == null && internship == null) {
            partTime = "Part-Time";
            fullTime = "Full-Time";
            freelance = "Freelance";
            internship = "Internship";
            remote = false; // đánh dấu "không lọc type"
        }
        if (officeOnly == null && remoteOnly == null && partialRemote == null) {
            officeOnly = "Office-Only";
            remoteOnly = "Remote-Only";
            partialRemote = "Partial-Remote";
            type = false;   // đánh dấu "không lọc remote"
        }

        List<JobPostActivity> jobPost;
        if (!dateSearchFlag && !remote && !type && !StringUtils.hasText(job) && !StringUtils.hasText(location)) {
            jobPost = jobPostActivityService.getAll();
        } else {
            jobPost = jobPostActivityService.search(
                    job, location,
                    Arrays.asList(partTime, fullTime, freelance, internship),
                    Arrays.asList(remoteOnly, officeOnly, partialRemote),
                    searchDate
            );
        }

        // Bổ sung trạng thái đã nộp/đã lưu & ngày đã đăng
        if (currentUserProfile instanceof JobSeekerProfile jsp) {
            List<JobSeekerApply> applied = jobSeekerApplyService.getCandidatesJobs(jsp);
            List<JobSeekerSave> saved = jobSeekerSaveService.getCandidatesJob(jsp);

            Map<Integer, Long> daysAgoMap = new HashMap<>();
            for (JobPostActivity jpa : jobPost) {
                // Days ago
                if (jpa.getPostedDate() != null) {
                    LocalDate posted = jpa.getPostedDate().toInstant()
                            .atZone(ZoneId.systemDefault())
                            .toLocalDate();
                    long daysAgo = ChronoUnit.DAYS.between(posted, LocalDate.now());
                    daysAgoMap.put(jpa.getJobPostId(), daysAgo);
                } else {
                    daysAgoMap.put(jpa.getJobPostId(), 0L);
                }

                boolean isApplied = applied.stream()
                        .anyMatch(a -> Objects.equals(a.getJob().getJobPostId(), jpa.getJobPostId()));
                boolean isSaved = saved.stream()
                        .anyMatch(s -> Objects.equals(s.getJob().getJobPostId(), jpa.getJobPostId()));

                jpa.setIsActive(isApplied);
                jpa.setIsSaved(isSaved);
            }
            model.addAttribute("daysAgoMap", daysAgoMap);
        }

        model.addAttribute("jobPost", jobPost);
        return "dashboard";
    }

    /* =================== ADD / EDIT / UPDATE / DELETE =================== */

    @GetMapping("/dashboard/add")
    public String addJobs(Model model) {
        model.addAttribute("jobPostActivity", new JobPostActivity());
        model.addAttribute("user", usersService.getCurrentUserProfile());
        return "add-jobs";
    }

    @PostMapping("/dashboard/addNew")
    public String addNew(@ModelAttribute JobPostActivity jobPostActivity,
                         @RequestParam("companyLogo") MultipartFile logo) {

        Users user = usersService.getCurrentUser();
        if (user != null) jobPostActivity.setPostedById(user);
        if (jobPostActivity.getPostedDate() == null) {
            jobPostActivity.setPostedDate(new Date());
        }

        // 1) Lưu job
        jobPostActivityService.addNew(jobPostActivity);

        // 2) Lưu logo nếu có
        if (!logo.isEmpty() && jobPostActivity.getJobCompanyId() != null) {
            String fileName = StringUtils.cleanPath(Objects.requireNonNull(logo.getOriginalFilename()));
            jobPostActivity.getJobCompanyId().setLogo(fileName);
            try {
                String uploadDir = "photos/company/" + jobPostActivity.getJobCompanyId().getId();
                FileUploadUtil.saveFile(uploadDir, fileName, logo);
                jobPostActivityService.addNew(jobPostActivity);
            } catch (IOException e) {
                throw new RuntimeException("Lỗi lưu file: " + e.getMessage());
            }
        }

        return "redirect:/job-details-apply/" + jobPostActivity.getJobPostId();
    }

    @GetMapping("/dashboard/edit/{id}")
    public String editJob(@PathVariable("id") int id, Model model) {
        JobPostActivity jobPostActivity = jobPostActivityService.getOne(id);
        model.addAttribute("jobPostActivity", jobPostActivity);
        model.addAttribute("user", usersService.getCurrentUserProfile());
        return "add-jobs";
    }

    @PostMapping("/dashboard/update/{id}")
    public String updateJob(@PathVariable("id") int id,
                            @ModelAttribute JobPostActivity form) {
        jobPostActivityService.updateFromForm(id, form);
        return "redirect:/dashboard/?updated=true";
    }

    @PostMapping("/dashboard/deleteJob/{id}")
    public String deleteJob(@PathVariable("id") int id, Model model) {
        try {
            jobPostActivityService.delete(id);
            return "redirect:/dashboard/?deleted=true";
        } catch (Exception e) {
            Object currentUserProfile = usersService.getCurrentUserProfile();
            model.addAttribute("user", currentUserProfile);
            model.addAttribute("error", "Error deleting job: " + e.getMessage());
            return "dashboard";
        }
    }

    /* ======================= GLOBAL SEARCH ======================= */

    @GetMapping("/global-search/")
    public String globalSearch(Model model,
                               @RequestParam(value = "job", required = false) String job,
                               @RequestParam(value = "location", required = false) String location,
                               @RequestParam(value = "partTime", required = false) String partTime,
                               @RequestParam(value = "fullTime", required = false) String fullTime,
                               @RequestParam(value = "freelance", required = false) String freelance,
                               @RequestParam(value = "internship", required = false) String internship,
                               @RequestParam(value = "remoteOnly", required = false) String remoteOnly,
                               @RequestParam(value = "officeOnly", required = false) String officeOnly,
                               @RequestParam(value = "partialRemote", required = false) String partialRemote,
                               @RequestParam(value = "today", required = false) boolean today,
                               @RequestParam(value = "days7", required = false) boolean days7,
                               @RequestParam(value = "days30", required = false) boolean days30) {

        // Bind lại các giá trị cho view
        model.addAttribute("job", job);
        model.addAttribute("location", location);
        model.addAttribute("partTime", Objects.equals(partTime, "Part-Time"));
        model.addAttribute("fullTime", Objects.equals(fullTime, "Full-Time"));
        model.addAttribute("freelance", Objects.equals(freelance, "Freelance"));
        model.addAttribute("internship", Objects.equals(internship, "Internship"));
        model.addAttribute("remoteOnly", Objects.equals(remoteOnly, "Remote-Only"));
        model.addAttribute("officeOnly", Objects.equals(officeOnly, "Office-Only"));
        model.addAttribute("partialRemote", Objects.equals(partialRemote, "Partial-Remote"));
        model.addAttribute("today", today);
        model.addAttribute("days7", days7);
        model.addAttribute("days30", days30);

        // Xác định ngày lọc
        LocalDate searchDate = null;
        boolean dateFilter = true;
        if (days30) searchDate = LocalDate.now().minusDays(30);
        else if (days7) searchDate = LocalDate.now().minusDays(7);
        else if (today) searchDate = LocalDate.now();
        else dateFilter = false;

        //  Nếu không có filter type hoặc remote, đặt mặc định
        boolean filterType = true;
        boolean filterRemote = true;

        if (partTime == null && fullTime == null && freelance == null && internship == null) {
            partTime = "Part-Time";
            fullTime = "Full-Time";
            freelance = "Freelance";
            internship = "Internship";
            filterType = false; // mặc định bỏ lọc
        }

        if (officeOnly == null && remoteOnly == null && partialRemote == null) {
            officeOnly = "Office-Only";
            remoteOnly = "Remote-Only";
            partialRemote = "Partial-Remote";
            filterRemote = false; // mặc định bỏ lọc
        }

        // Lấy danh sách job
        List<JobPostActivity> jobPost;
        if (!dateFilter && !filterType && !filterRemote && !StringUtils.hasText(job) && !StringUtils.hasText(location)) {
            jobPost = jobPostActivityService.getAll(); // không filter gì cả
        } else {
            jobPost = jobPostActivityService.search(
                    job, location,
                    Arrays.asList(partTime, fullTime, freelance, internship),
                    Arrays.asList(remoteOnly, officeOnly, partialRemote),
                    searchDate
            );
        }

        // Tính số ngày đã đăng để hiển thị
        Map<Integer, Long> daysAgoMap = new HashMap<>();
        for (JobPostActivity jpa : jobPost) {
            if (jpa.getPostedDate() != null) {
                LocalDate posted = jpa.getPostedDate().toInstant()
                        .atZone(ZoneId.systemDefault())
                        .toLocalDate();
                long daysAgo = ChronoUnit.DAYS.between(posted, LocalDate.now());
                daysAgoMap.put(jpa.getJobPostId(), daysAgo);
            } else {
                daysAgoMap.put(jpa.getJobPostId(), 0L);
            }
        }

        model.addAttribute("daysAgoMap", daysAgoMap);
        model.addAttribute("jobPost", jobPost);

        return "global-search";
    }

}
