

<div class="card mb-4 shadow-sm report-card" id="report-{{ $report->id }}">
    <div class="report-card-header">
    @if ($report->owner)
        <a href="{{ url('/user/' . $report->owner->id) }}" id="report-owner" class="d-flex align-items-center">
            <img src="{{ $report->owner->getPicture() }}" class="rounded-circle me-2" alt="User profile picture" width="40px" height="40px">
            <h3>{{ $report->owner->username }}</h3>
        </a>
    @else
        <div id="report-owner" class="d-flex align-items-center">
            <img src="{{ url('icons/profilepic.png') }}" class="rounded-circle me-2" alt="Deleted User" width="40px" height="40px">
            <h5 class="mb-0">Deleted User</h5>
        </div>
    @endif
    <small class="ms-auto text-muted">{{ \Carbon\Carbon::parse($post->created_at)->format('d/m/Y H:i') }}</small>
    </div>
    <div class="report-card-content">
        <p>{{ $report->content }}</p>
    </div>
</div>
