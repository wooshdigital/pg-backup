package backup

// Pipeline is a convenience type that groups the stages of a backup together.
// It is kept here for future extensibility (e.g. adding pre/post hooks).
type Pipeline struct {
	job *Job
}

// NewPipeline wraps a Job in a Pipeline.
func NewPipeline(job *Job) *Pipeline {
	return &Pipeline{job: job}
}